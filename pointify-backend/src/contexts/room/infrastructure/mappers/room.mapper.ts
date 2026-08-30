import { Room, type RoomProps } from '../../domain/room.aggregate.js';
import { Participant } from '../../domain/entities/participant.entity.js';
import { Round, type RoundStatus } from '../../domain/entities/round.entity.js';
import { Deck, type DeckType } from '../../domain/value-objects/deck.vo.js';
import { FacilitatorKey } from '../../domain/value-objects/facilitator-key.vo.js';
import { Estimate } from '../../domain/value-objects/estimate.vo.js';
import type { CardValue } from '../../domain/value-objects/card.vo.js';

export interface FirestoreParticipantDoc {
  id: string;
  displayName: string;
  photoURL: string | null;
  isGuest: boolean;
  isSpectator: boolean;
  isOnline: boolean;
  joinedAt: number;
  lastActiveAt: number;
}

export interface FirestoreEstimateDoc {
  participantId: string;
  cardValue: CardValue;
  submittedAt: number;
}

export interface FirestoreRoundDoc {
  roundNumber: number;
  status: RoundStatus;
  topic: string;
  estimates: FirestoreEstimateDoc[];
  startedAt: number;
  revealedAt: number | null;
}

export interface FirestoreRoomDoc {
  id: string;
  name: string;
  facilitatorId: string;
  facilitatorKey: string;
  deck: {
    type: DeckType;
    cards: CardValue[];
  };
  participants: FirestoreParticipantDoc[];
  currentRound: FirestoreRoundDoc;
  roundsHistory: FirestoreRoundDoc[];
  version: number;
  createdAt: number;
  updatedAt: number;
}

export class RoomMapper {
  public static toPersistence(room: Room): FirestoreRoomDoc {
    const participants: FirestoreParticipantDoc[] = Array.from(room.participants.values()).map(
      (p) => ({
        id: p.id,
        displayName: p.displayName,
        photoURL: p.photoURL,
        isGuest: p.isGuest,
        isSpectator: p.isSpectator,
        isOnline: p.isOnline,
        joinedAt: p.joinedAt,
        lastActiveAt: p.lastActiveAt,
      }),
    );

    const mapRound = (r: Round): FirestoreRoundDoc => ({
      roundNumber: r.roundNumber,
      status: r.status,
      topic: r.topic,
      estimates: Array.from(r.estimates.values()).map((e) => ({
        participantId: e.participantId,
        cardValue: e.cardValue,
        submittedAt: e.submittedAt,
      })),
      startedAt: r.startedAt,
      revealedAt: r.revealedAt,
    });

    return {
      id: room.id,
      name: room.name,
      facilitatorId: room.facilitatorId,
      facilitatorKey: room.facilitatorKey.value,
      deck: {
        type: room.deck.type,
        cards: room.deck.cards.map((c) => c.value),
      },
      participants,
      currentRound: mapRound(room.currentRound),
      roundsHistory: room.roundsHistory.map((r) => mapRound(r)),
      version: room.version,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  public static toDomain(doc: FirestoreRoomDoc): Room {
    const participantsMap = new Map<string, Participant>();
    for (const p of doc.participants || []) {
      participantsMap.set(
        p.id,
        Participant.create(p.id, {
          displayName: p.displayName,
          photoURL: p.photoURL,
          isGuest: p.isGuest,
          isSpectator: p.isSpectator,
          isOnline: p.isOnline,
          joinedAt: p.joinedAt,
          lastActiveAt: p.lastActiveAt,
        }),
      );
    }

    const unmapRound = (rd: FirestoreRoundDoc): Round => {
      const estimatesMap = new Map<string, Estimate>();
      for (const e of rd.estimates || []) {
        estimatesMap.set(
          e.participantId,
          Estimate.create(e.participantId, e.cardValue, e.submittedAt),
        );
      }
      return Round.reconstruct(rd.roundNumber, {
        status: rd.status,
        topic: rd.topic,
        estimates: estimatesMap,
        startedAt: rd.startedAt,
        revealedAt: rd.revealedAt,
      });
    };

    const deck = Deck.fromType(doc.deck.type, doc.deck.cards);
    const facilitatorKey = FacilitatorKey.fromExisting(doc.facilitatorKey);
    const currentRound = unmapRound(doc.currentRound);
    const roundsHistory = (doc.roundsHistory || []).map((r) => unmapRound(r));

    const props: RoomProps = {
      name: doc.name,
      facilitatorId: doc.facilitatorId,
      facilitatorKey,
      deck,
      participants: participantsMap,
      currentRound,
      roundsHistory,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return Room.reconstruct(doc.id, props, doc.version || 0);
  }
}
