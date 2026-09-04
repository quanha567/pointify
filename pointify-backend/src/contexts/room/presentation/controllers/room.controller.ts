import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateRoomUseCase } from '../../application/use-cases/create-room.use-case.js';
import { GetRoomUseCase } from '../../application/use-cases/get-room.use-case.js';
import { JoinRoomUseCase } from '../../application/use-cases/join-room.use-case.js';
import { SubmitEstimateUseCase } from '../../application/use-cases/submit-estimate.use-case.js';
import { RevealCardsUseCase } from '../../application/use-cases/reveal-cards.use-case.js';
import { NextRoundUseCase } from '../../application/use-cases/next-round.use-case.js';
import { ClaimFacilitatorUseCase } from '../../application/use-cases/claim-facilitator.use-case.js';
import {
  CreateRoomRequestDto,
  JoinRoomRequestDto,
  SubmitEstimateRequestDto,
  RevealCardsRequestDto,
  NextRoundRequestDto,
  ClaimFacilitatorRequestDto,
} from '../dtos/room-request.dto.js';

@ApiTags('Rooms')
@Controller('api/rooms')
export class RoomController {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly getRoomUseCase: GetRoomUseCase,
    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly submitEstimateUseCase: SubmitEstimateUseCase,
    private readonly revealCardsUseCase: RevealCardsUseCase,
    private readonly nextRoundUseCase: NextRoundUseCase,
    private readonly claimFacilitatorUseCase: ClaimFacilitatorUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new estimation room',
    description:
      'Creates a Scrum Poker room with custom or standard deck, and returns room state with secret facilitatorKey.',
  })
  @ApiBody({ type: CreateRoomRequestDto })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input parameters' })
  async createRoom(@Body() body: CreateRoomRequestDto) {
    const result = await this.createRoomUseCase.execute(body);
    if (result.isFail) {
      throw new BadRequestException(result.error.message);
    }
    return {
      success: true,
      data: result.value,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get room state snapshot',
    description:
      'Retrieves sanitized projection of the room for a participant or spectator. Cards remain masked during voting phase unless owned by viewerId.',
  })
  @ApiParam({ name: 'id', description: 'Unique Room ID / Code', example: 'a1b2c3d4' })
  @ApiQuery({
    name: 'viewerId',
    required: false,
    description: 'Participant ID of the requester to unmask own vote',
  })
  @ApiResponse({ status: 200, description: 'Room snapshot retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoom(@Param('id') id: string, @Query('viewerId') viewerId?: string) {
    const result = await this.getRoomUseCase.execute(id, viewerId);
    if (result.isFail) {
      throw new NotFoundException(result.error.message);
    }
    return {
      success: true,
      data: result.value,
      room: result.value,
    };
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Join an existing estimation room',
    description: 'Adds or updates a participant in the room roster.',
  })
  @ApiParam({ name: 'id', description: 'Unique Room ID / Code' })
  @ApiBody({ type: JoinRoomRequestDto })
  @ApiResponse({ status: 200, description: 'Participant joined room successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async joinRoom(@Param('id') roomId: string, @Body() body: JoinRoomRequestDto) {
    const result = await this.joinRoomUseCase.execute({
      roomId,
      participant: body.participant,
    });
    if (result.isFail) {
      throw new NotFoundException(result.error.message);
    }
    return {
      success: true,
      room: result.value,
    };
  }

  @Post(':id/estimate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit or change card estimation',
    description:
      'Submits a vote for the current voting round. Fails if voting is closed or card value is not in deck.',
  })
  @ApiParam({ name: 'id', description: 'Unique Room ID / Code' })
  @ApiBody({ type: SubmitEstimateRequestDto })
  @ApiResponse({ status: 200, description: 'Estimate recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid card or round closed' })
  async submitEstimate(@Param('id') roomId: string, @Body() body: SubmitEstimateRequestDto) {
    const result = await this.submitEstimateUseCase.execute({
      roomId,
      participantId: body.participantId,
      cardValue: body.cardValue,
    });

    if (result.isFail) {
      throw new BadRequestException(result.error.message);
    }

    return {
      success: true,
      room: result.value,
    };
  }

  @Post(':id/reveal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reveal cards and compute round statistics',
    description:
      'Requires secret facilitatorKey. Changes round status to revealed and calculates average, min, max, consensus.',
  })
  @ApiParam({ name: 'id', description: 'Unique Room ID / Code' })
  @ApiBody({ type: RevealCardsRequestDto })
  @ApiResponse({ status: 200, description: 'Cards revealed and statistics computed' })
  @ApiResponse({ status: 403, description: 'Invalid facilitatorKey' })
  async revealCards(@Param('id') roomId: string, @Body() body: RevealCardsRequestDto) {
    const result = await this.revealCardsUseCase.execute({
      roomId,
      facilitatorKey: body.facilitatorKey,
    });

    if (result.isFail) {
      throw new ForbiddenException(result.error.message);
    }

    return {
      success: true,
      room: result.value,
    };
  }

  @Post(':id/next-round')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start next estimation round',
    description:
      'Archives current round to history, resets votes, and initializes a new voting round.',
  })
  @ApiParam({ name: 'id', description: 'Unique Room ID / Code' })
  @ApiBody({ type: NextRoundRequestDto })
  @ApiResponse({ status: 200, description: 'Next round started successfully' })
  @ApiResponse({ status: 403, description: 'Invalid facilitatorKey' })
  async nextRound(@Param('id') roomId: string, @Body() body: NextRoundRequestDto) {
    const result = await this.nextRoundUseCase.execute({
      roomId,
      facilitatorKey: body.facilitatorKey,
      nextTopic: body.nextTopic,
    });

    if (result.isFail) {
      throw new ForbiddenException(result.error.message);
    }

    return {
      success: true,
      room: result.value,
    };
  }

  @Post(':id/claim-facilitator')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Claim host/facilitator role if host left or disconnected',
    description:
      'Allows an active participant to assume facilitator privileges if the original host has left.',
  })
  @ApiParam({ name: 'id', description: 'Unique Room ID / Code' })
  @ApiBody({ type: ClaimFacilitatorRequestDto })
  @ApiResponse({ status: 200, description: 'Facilitator role transferred successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot claim facilitator while current host is active',
  })
  async claimFacilitator(@Param('id') roomId: string, @Body() body: ClaimFacilitatorRequestDto) {
    const result = await this.claimFacilitatorUseCase.execute({
      roomId,
      claimantId: body.claimantId,
    });

    if (result.isFail) {
      throw new BadRequestException(result.error.message);
    }

    return {
      success: true,
      data: result.value,
    };
  }
}
