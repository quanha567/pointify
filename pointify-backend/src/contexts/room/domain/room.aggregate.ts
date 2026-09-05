import { AggregateRoot } from '../../../shared/domain/aggregate-root.base.js';
import { Participant } from './entities/participant.entity.js';
import { Round, type RoundStatistics, type RoundTimer } from './entities/round.entity.js';
import {
  StickyNote,
  type StickyNoteColor,
  type StickyNotePosition,
  type StickyNoteProjection,
  type StickyNoteEditingUser,
} from './entities/sticky-note.entity.js';
import { Deck, type DeckType } from './value-objects/deck.vo.js';
import { FacilitatorKey } from './value-objects/facilitator-key.vo.js';
import type { CardValue } from './value-objects/card.vo.js';
import {
  InvalidCardValueError,
  ParticipantNotFoundError,
  RoundAlreadyRevealedError,
  UnauthorizedFacilitatorError,
  CannotClaimFacilitatorError,
} from './room.errors.js';
import { ok, fail, type Result } from '../../../shared/domain/result.js';

export interface RoomProps {
  name: string;
  facilitatorId: string;
  facilitatorKey: FacilitatorKey;
  deck: Deck;
  participants: Map<string, Participant>;
  stickyNotes: Map<string, StickyNote>;
  currentRound: Round;
  roundsHistory: Round[];
  createdAt: number;
  updatedAt: number;
}

export interface ParticipantProjection {
  id: string;
  displayName: string;
  photoURL: string | null;
  isGuest: boolean;
  isSpectator: boolean;
  isOnline: boolean;
  isFacilitator: boolean;
  hasEstimated: boolean;
  estimatedValue: CardValue | null;
}

export interface RoomProjection {
  id: string;
  name: string;
  deckType: DeckType;
  deckCards: CardValue[];
  facilitatorId: string;
  version: number;
  participants: ParticipantProjection[];
  stickyNotes: StickyNoteProjection[];
  currentRound: {
    roundNumber: number;
    status: 'voting' | 'revealed' | 'completed';
    topic: string;
    startedAt: number;
    revealedAt: number | null;
    statistics: RoundStatistics | null;
    timer: RoundTimer | null;
    archivedStickyNotes?: StickyNoteProjection[];
  };
  roundsHistoryCount: number;
  createdAt: number;
  updatedAt: number;
}

export class Room extends AggregateRoot<RoomProps, string> {
  private static readonly FACILITATOR_CLAIM_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

  private constructor(id: string, props: RoomProps, version = 0) {
    super(id, props);
    this._version = version;
  }

  public static create(params: {
    id: string;
    name: string;
    facilitator: Participant;
    deck?: Deck;
    facilitatorKey?: FacilitatorKey;
  }): Room {
    const now = Date.now();
    const deck = params.deck || Deck.fibonacci();
    const facilitatorKey = params.facilitatorKey || FacilitatorKey.generate();

    const participants = new Map<string, Participant>();
    participants.set(params.facilitator.id, params.facilitator);

    const initialRound = Round.startNew(1);

    const room = new Room(
      params.id,
      {
        name: params.name.trim() || 'Scrum Poker Room',
        facilitatorId: params.facilitator.id,
        facilitatorKey,
        deck,
        participants,
        stickyNotes: new Map<string, StickyNote>(),
        currentRound: initialRound,
        roundsHistory: [],
        createdAt: now,
        updatedAt: now,
      },
      1,
    );

    return room;
  }

  public static reconstruct(id: string, props: RoomProps, version: number): Room {
    if (!props.stickyNotes) {
      props.stickyNotes = new Map<string, StickyNote>();
    }
    return new Room(id, props, version);
  }

  get name(): string {
    return this.props.name;
  }

  get facilitatorId(): string {
    return this.props.facilitatorId;
  }

  get facilitatorKey(): FacilitatorKey {
    return this.props.facilitatorKey;
  }

  get deck(): Deck {
    return this.props.deck;
  }

  get participants(): ReadonlyMap<string, Participant> {
    return this.props.participants;
  }

  get stickyNotes(): ReadonlyMap<string, StickyNote> {
    return this.props.stickyNotes;
  }

  public addStickyNote(note: StickyNote): void {
    this.props.stickyNotes.set(note.id, note);
    this.touch();
  }

  public moveStickyNote(id: string, position: StickyNotePosition): boolean {
    const note = this.props.stickyNotes.get(id);
    if (!note) return false;
    note.setPosition(position);
    this.touch();
    return true;
  }

  public editStickyNote(id: string, text: string, color?: StickyNoteColor): boolean {
    const note = this.props.stickyNotes.get(id);
    if (!note) return false;
    note.setText(text);
    if (color) {
      note.setColor(color);
    }
    this.touch();
    return true;
  }

  public togglePinStickyNote(id: string): boolean | null {
    const note = this.props.stickyNotes.get(id);
    if (!note) return null;
    const isPinned = note.togglePinned();
    this.touch();
    return isPinned;
  }

  public deleteStickyNote(id: string): boolean {
    const deleted = this.props.stickyNotes.delete(id);
    if (deleted) {
      this.touch();
    }
    return deleted;
  }

  public setStickyNoteEditing(id: string, editingBy: StickyNoteEditingUser | null): boolean {
    const note = this.props.stickyNotes.get(id);
    if (!note) return false;
    note.setEditingBy(editingBy);
    return true;
  }

  get currentRound(): Round {
    return this.props.currentRound;
  }

  get roundsHistory(): ReadonlyArray<Round> {
    return this.props.roundsHistory;
  }

  get createdAt(): number {
    return this.props.createdAt;
  }

  get updatedAt(): number {
    return this.props.updatedAt;
  }

  public join(participant: Participant): void {
    const existing = this.props.participants.get(participant.id);
    if (existing) {
      existing.setOnline(true);
      existing.touch();
    } else {
      this.props.participants.set(participant.id, participant);
    }
    this.touch();
  }

  public leave(participantId: string): void {
    const participant = this.props.participants.get(participantId);
    if (participant) {
      participant.setOnline(false);
      this.touch();
    }
  }

  public setParticipantOnline(participantId: string, isOnline: boolean): void {
    const participant = this.props.participants.get(participantId);
    if (participant) {
      participant.setOnline(isOnline);
      this.touch();
    }
  }

  public switchParticipantRole(
    participantId: string,
    isSpectator: boolean,
  ): Result<void, ParticipantNotFoundError> {
    const participant = this.props.participants.get(participantId);
    if (!participant) {
      return fail(new ParticipantNotFoundError(participantId));
    }

    participant.setSpectator(isSpectator);
    if (isSpectator) {
      this.props.currentRound.clearEstimate(participantId);
    }
    this.touch();
    return ok(undefined);
  }

  public submitEstimate(
    participantId: string,
    cardValue: CardValue,
  ): Result<void, ParticipantNotFoundError | InvalidCardValueError | RoundAlreadyRevealedError> {
    const participant = this.props.participants.get(participantId);
    if (!participant) {
      return fail(new ParticipantNotFoundError(participantId));
    }

    if (this.props.currentRound.status !== 'voting') {
      return fail(new RoundAlreadyRevealedError());
    }

    if (!this.props.deck.isValidCard(cardValue)) {
      return fail(new InvalidCardValueError(cardValue));
    }

    this.props.currentRound.submitEstimate(participantId, cardValue);
    participant.touch();
    this.touch();

    return ok(undefined);
  }

  public clearEstimate(
    participantId: string,
  ): Result<void, ParticipantNotFoundError | RoundAlreadyRevealedError> {
    const participant = this.props.participants.get(participantId);
    if (!participant) {
      return fail(new ParticipantNotFoundError(participantId));
    }

    if (this.props.currentRound.status !== 'voting') {
      return fail(new RoundAlreadyRevealedError());
    }

    this.props.currentRound.clearEstimate(participantId);
    this.touch();
    return ok(undefined);
  }

  public revealCards(key: string): Result<void, UnauthorizedFacilitatorError> {
    if (!this.props.facilitatorKey.matches(key)) {
      return fail(new UnauthorizedFacilitatorError('Invalid facilitator key'));
    }

    this.props.currentRound.reveal();
    this.touch();
    return ok(undefined);
  }

  public resetRound(key: string): Result<void, UnauthorizedFacilitatorError> {
    if (!this.props.facilitatorKey.matches(key)) {
      return fail(new UnauthorizedFacilitatorError('Invalid facilitator key'));
    }

    const unpinnedNotes = Array.from(this.props.stickyNotes.values()).filter((n) => !n.isPinned);
    this.props.currentRound.setArchivedStickyNotes(unpinnedNotes.map((n) => n.toProjection()));
    for (const unpinned of unpinnedNotes) {
      this.props.stickyNotes.delete(unpinned.id);
    }

    this.props.currentRound.reset();
    this.touch();
    return ok(undefined);
  }

  public nextRound(key: string, nextTopic = ''): Result<Round, UnauthorizedFacilitatorError> {
    if (!this.props.facilitatorKey.matches(key)) {
      return fail(new UnauthorizedFacilitatorError('Invalid facilitator key'));
    }

    const unpinnedNotes = Array.from(this.props.stickyNotes.values()).filter((n) => !n.isPinned);
    this.props.currentRound.setArchivedStickyNotes(unpinnedNotes.map((n) => n.toProjection()));
    for (const unpinned of unpinnedNotes) {
      this.props.stickyNotes.delete(unpinned.id);
    }

    this.props.currentRound.complete();
    this.props.roundsHistory.push(this.props.currentRound);

    const nextRoundNumber = this.props.roundsHistory.length + 1;
    const cleanTopic = typeof nextTopic === 'string' ? nextTopic.trim() : '';
    this.props.currentRound = Round.startNew(nextRoundNumber, cleanTopic);

    this.touch();
    return ok(this.props.currentRound);
  }

  public startTimer(key: string, durationSeconds: number): Result<void, UnauthorizedFacilitatorError> {
    if (!this.props.facilitatorKey.matches(key)) {
      return fail(new UnauthorizedFacilitatorError('Invalid facilitator key'));
    }
    this.props.currentRound.startTimer(durationSeconds);
    this.touch();
    return ok(undefined);
  }

  public pauseTimer(key: string): Result<void, UnauthorizedFacilitatorError> {
    if (!this.props.facilitatorKey.matches(key)) {
      return fail(new UnauthorizedFacilitatorError('Invalid facilitator key'));
    }
    this.props.currentRound.pauseTimer();
    this.touch();
    return ok(undefined);
  }

  public resumeTimer(key: string): Result<void, UnauthorizedFacilitatorError> {
    if (!this.props.facilitatorKey.matches(key)) {
      return fail(new UnauthorizedFacilitatorError('Invalid facilitator key'));
    }
    this.props.currentRound.resumeTimer();
    this.touch();
    return ok(undefined);
  }

  public stopTimer(key: string): Result<void, UnauthorizedFacilitatorError> {
    if (!this.props.facilitatorKey.matches(key)) {
      return fail(new UnauthorizedFacilitatorError('Invalid facilitator key'));
    }
    this.props.currentRound.stopTimer();
    this.touch();
    return ok(undefined);
  }

  public addTimerSeconds(key: string, seconds: number): Result<void, UnauthorizedFacilitatorError> {
    if (!this.props.facilitatorKey.matches(key)) {
      return fail(new UnauthorizedFacilitatorError('Invalid facilitator key'));
    }
    this.props.currentRound.addTimerSeconds(seconds);
    this.touch();
    return ok(undefined);
  }

  public updateConfig(
    key: string,
    updates: { name?: string; deck?: Deck },
  ): Result<{ clearedVotes: boolean }, UnauthorizedFacilitatorError> {
    if (!this.props.facilitatorKey.matches(key)) {
      return fail(new UnauthorizedFacilitatorError('Invalid facilitator key'));
    }

    let clearedVotes = false;

    if (updates.name && updates.name.trim()) {
      this.props.name = updates.name.trim();
    }

    if (updates.deck && updates.deck.type !== this.props.deck.type) {
      this.props.deck = updates.deck;
      if (this.props.currentRound.status === 'voting' && this.props.currentRound.estimates.size > 0) {
        this.props.currentRound.clearAllEstimates();
        clearedVotes = true;
      }
    }

    this.touch();
    return ok({ clearedVotes });
  }

  public claimFacilitator(claimantId: string): Result<FacilitatorKey, CannotClaimFacilitatorError> {
    const claimant = this.props.participants.get(claimantId);
    if (!claimant) {
      return fail(new CannotClaimFacilitatorError('Claimant is not a participant in this room'));
    }

    const currentFacilitator = this.props.participants.get(this.props.facilitatorId);
    const now = Date.now();

    if (
      currentFacilitator &&
      currentFacilitator.isOnline &&
      now - currentFacilitator.lastActiveAt < Room.FACILITATOR_CLAIM_TIMEOUT_MS
    ) {
      return fail(
        new CannotClaimFacilitatorError(
          `Current facilitator is still active or within the 15-minute grace period`,
        ),
      );
    }

    // Transfer facilitator role
    this.props.facilitatorId = claimantId;
    const newKey = FacilitatorKey.generate();
    this.props.facilitatorKey = newKey;
    this.touch();

    return ok(newKey);
  }

  public toProjection(viewerParticipantId?: string): RoomProjection {
    const isRevealed = this.props.currentRound.status === 'revealed';
    const estimates = this.props.currentRound.estimates;

    const participantsList: ParticipantProjection[] = Array.from(
      this.props.participants.values(),
    ).map((p) => {
      const estimate = estimates.get(p.id);
      const hasEstimated = estimate !== undefined;

      let estimatedValue: CardValue | null = null;
      if (hasEstimated) {
        if (isRevealed || p.id === viewerParticipantId) {
          estimatedValue = estimate.cardValue;
        }
      }

      return {
        id: p.id,
        displayName: p.displayName,
        photoURL: p.photoURL,
        isGuest: p.isGuest,
        isSpectator: p.isSpectator,
        isOnline: p.isOnline,
        isFacilitator: p.id === this.props.facilitatorId,
        hasEstimated,
        estimatedValue,
      };
    });

    return {
      id: this.id,
      name: this.props.name,
      deckType: this.props.deck.type,
      deckCards: this.props.deck.cards.map((c) => c.value),
      facilitatorId: this.props.facilitatorId,
      version: this._version,
      participants: participantsList,
      stickyNotes: Array.from(this.props.stickyNotes.values()).map((n) => n.toProjection()),
      currentRound: {
        roundNumber: this.props.currentRound.roundNumber,
        status: this.props.currentRound.status,
        topic: this.props.currentRound.topic,
        startedAt: this.props.currentRound.startedAt,
        revealedAt: this.props.currentRound.revealedAt,
        statistics: isRevealed ? this.props.currentRound.calculateStatistics() : null,
        timer: this.props.currentRound.timer,
        archivedStickyNotes: [...this.props.currentRound.archivedStickyNotes],
      },
      roundsHistoryCount: this.props.roundsHistory.length,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  private touch(): void {
    this.props.updatedAt = Date.now();
    this.incrementVersion();
  }
}
