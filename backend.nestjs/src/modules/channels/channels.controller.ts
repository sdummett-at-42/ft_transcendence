import { Controller, ParseIntPipe } from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { Get, Post, Patch, Delete, Body, Req, Param, HttpException } from "@nestjs/common";
import { CreateChannelDto, UpdateChannelDto } from "./channel.dto";

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channels: ChannelsService) { }

	@Post()
	createChannel(@Req() request, @Body() dto: CreateChannelDto) {
		return this.channels.createChannel(request.user.id, dto);
	}

	@Get()
	findAllPublicChannels() {
		return this.channels.findAllPublicChannels();
	}

	@Get(':id')
	findOnePublicChannelById(@Param('id', ParseIntPipe) id: number) {
		return this.channels.findOnePublicChannelById(id);
	}

	@Patch(':id')
	async updateChannel(@Req() request, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateChannelDto) {
		const channel = await this.channels.findOneChannelById(id);
		this.checkIfUserIsOwner(request, channel);
		return this.channels.updateChannel(id, dto);
	}

	checkIfUserIsOwner(request, channel) {
		if (request.user.id !== channel.owner.id)
			throw new HttpException('You are not the owner of this channel', 403);
	}
}