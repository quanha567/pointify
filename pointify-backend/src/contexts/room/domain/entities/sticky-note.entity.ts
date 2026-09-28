import { Entity } from '../../../../shared/domain/entity.base.js';

export type StickyNoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';

export interface StickyNotePosition {
  x: number;
  y: number;
}

export interface StickyNoteEditingUser {
  userId: string;
  userName: string;
}

export interface StickyNoteProps {
  roomId: string;
  text: string;
  color: StickyNoteColor;
  position: StickyNotePosition;
  authorId: string;
  authorName: string;
  isPinned: boolean;
  editingBy?: StickyNoteEditingUser | null;
  jiraKey?: string;
  jiraUrl?: string;
  issueType?: string;
  storyPoints?: number | string | null;
  createdAt: number;
  updatedAt: number;
}

export interface StickyNoteProjection {
  id: string;
  roomId: string;
  text: string;
  color: StickyNoteColor;
  position: StickyNotePosition;
  authorId: string;
  authorName: string;
  isPinned: boolean;
  editingBy?: StickyNoteEditingUser | null;
  jiraKey?: string;
  jiraUrl?: string;
  issueType?: string;
  storyPoints?: number | string | null;
  createdAt: number;
  updatedAt: number;
}

export class StickyNote extends Entity<StickyNoteProps, string> {
  private constructor(id: string, props: StickyNoteProps) {
    super(id, props);
  }

  public static create(
    id: string,
    props: {
      roomId: string;
      text?: string;
      color?: StickyNoteColor;
      position: StickyNotePosition;
      authorId: string;
      authorName: string;
      isPinned?: boolean;
      jiraKey?: string;
      jiraUrl?: string;
      issueType?: string;
      storyPoints?: number | string | null;
    },
  ): StickyNote {
    const now = Date.now();
    return new StickyNote(id, {
      roomId: props.roomId,
      text: props.text ?? '',
      color: props.color ?? 'yellow',
      position: props.position,
      authorId: props.authorId,
      authorName: props.authorName.trim() || 'Anonymous',
      isPinned: props.isPinned ?? false,
      editingBy: null,
      jiraKey: props.jiraKey,
      jiraUrl: props.jiraUrl,
      issueType: props.issueType,
      storyPoints: props.storyPoints,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstruct(id: string, props: StickyNoteProps): StickyNote {
    return new StickyNote(id, props);
  }

  get roomId(): string {
    return this.props.roomId;
  }

  get text(): string {
    return this.props.text;
  }

  get color(): StickyNoteColor {
    return this.props.color;
  }

  get position(): StickyNotePosition {
    return this.props.position;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get authorName(): string {
    return this.props.authorName;
  }

  get isPinned(): boolean {
    return this.props.isPinned;
  }

  get editingBy(): StickyNoteEditingUser | null | undefined {
    return this.props.editingBy;
  }

  get createdAt(): number {
    return this.props.createdAt;
  }

  get updatedAt(): number {
    return this.props.updatedAt;
  }

  public setText(text: string): void {
    this.props.text = text;
    this.touch();
  }

  public setColor(color: StickyNoteColor): void {
    this.props.color = color;
    this.touch();
  }

  public setPosition(position: StickyNotePosition): void {
    this.props.position = { ...position };
    this.touch();
  }

  public setPinned(isPinned: boolean): void {
    this.props.isPinned = isPinned;
    this.touch();
  }

  public togglePinned(): boolean {
    this.props.isPinned = !this.props.isPinned;
    this.touch();
    return this.props.isPinned;
  }

  public setEditingBy(user: StickyNoteEditingUser | null): void {
    this.props.editingBy = user;
    this.touch();
  }

  public setStoryPoints(points: number | string | null): void {
    this.props.storyPoints = points;
    this.touch();
  }

  get jiraKey(): string | undefined {
    return this.props.jiraKey;
  }

  get jiraUrl(): string | undefined {
    return this.props.jiraUrl;
  }

  get issueType(): string | undefined {
    return this.props.issueType;
  }

  get storyPoints(): number | string | null | undefined {
    return this.props.storyPoints;
  }

  public toProjection(): StickyNoteProjection {
    return {
      id: this._id,
      roomId: this.props.roomId,
      text: this.props.text,
      color: this.props.color,
      position: { ...this.props.position },
      authorId: this.props.authorId,
      authorName: this.props.authorName,
      isPinned: this.props.isPinned,
      editingBy: this.props.editingBy ? { ...this.props.editingBy } : null,
      jiraKey: this.props.jiraKey,
      jiraUrl: this.props.jiraUrl,
      issueType: this.props.issueType,
      storyPoints: this.props.storyPoints,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  private touch(): void {
    this.props.updatedAt = Date.now();
  }
}
