import React, { useState, useEffect } from "react";
import angryBoredDisappointedSvg from './svg-emojis/angry-bored-disappointed.svg';
import cryingEmojiEmoticonSvg from './svg-emojis/crying-emoji-emoticon.svg';
import emojiEmoticonHappySvg from './svg-emojis/emoji-emoticon-happy.svg';
import angryBoredEmojiSvg from './svg-emojis/angry-bored-emoji.svg';
import deadEmojiEmoticonSvg from './svg-emojis/dead-emoji-emoticon.svg';
import emojiEmoticonHeart2Svg from './svg-emojis/emoji-emoticon-heart-2.svg';
import animeEmojiEmoticon2Svg from './svg-emojis/anime-emoji-emoticon-2.svg';
import disgustedEmojiEmoticonSvg from './svg-emojis/disgusted-emoji-emoticon.svg';
import emojiEmoticonHeartSvg from './svg-emojis/emoji-emoticon-heart.svg';
import animeEmojiEmoticonSvg from './svg-emojis/anime-emoji-emoticon.svg';
import emojiEmoticonEmotionSvg from './svg-emojis/emoji-emoticon-emotion.svg';
import emojiEmoticonPainSvg from './svg-emojis/emoji-emoticon-pain.svg';
import awkwardDropEmojiSvg from './svg-emojis/awkward-drop-emoji.svg';
import emojiEmoticonEyesSvg from './svg-emojis/emoji-emoticon-eyes.svg';
import emojiEmoticonFakeSvg from './svg-emojis/emoji-emoticon-fake.svg';
import boredDisappointedEmojiSvg from './svg-emojis/bored-disappointed-emoji.svg';
import emojiEmoticonHappy2Svg from './svg-emojis/emoji-emoticon-happy-2.svg';
import cryEmojiEmoticon2Svg from './svg-emojis/cry-emoji-emoticon-2.svg';
import emojiEmoticonHappy3Svg from './svg-emojis/emoji-emoticon-happy-3.svg';
import emojiEmoticonSad2Svg from './svg-emojis/emoji-emoticon-sad-2.svg';
import blinkEmojiEmoticonSvg from './svg-emojis/blink-emoji-emoticon.svg';
import emojiEmoticonSad3Svg from './svg-emojis/emoji-emoticon-sad-3.svg';
import emojiEmoticonSad4Svg from './svg-emojis/emoji-emoticon-sad-4.svg';
import cryEmojiEmoticonSvg from './svg-emojis/cry-emoji-emoticon.svg';
import emojiEmoticonHappy4Svg from './svg-emojis/emoji-emoticon-happy-4.svg';
import emojiEmoticonSadSvg from './svg-emojis/emoji-emoticon-sad.svg';
import emojiEmoticonSleepSvg from './svg-emojis/emoji-emoticon-sleep.svg';import './NotFound.css';

const svgs = [
	angryBoredDisappointedSvg,
	cryingEmojiEmoticonSvg,
	emojiEmoticonHappySvg,
	angryBoredEmojiSvg,
	deadEmojiEmoticonSvg,
	emojiEmoticonHeart2Svg,
	animeEmojiEmoticon2Svg,
	disgustedEmojiEmoticonSvg,
	emojiEmoticonHeartSvg,
	animeEmojiEmoticonSvg,
	emojiEmoticonEmotionSvg,
	emojiEmoticonPainSvg,
	awkwardDropEmojiSvg,
	emojiEmoticonEyesSvg,
	emojiEmoticonFakeSvg,
	boredDisappointedEmojiSvg,
	emojiEmoticonHappy2Svg,
	cryEmojiEmoticon2Svg,
	emojiEmoticonHappy3Svg,
	emojiEmoticonSad2Svg,
	blinkEmojiEmoticonSvg,
	emojiEmoticonSad3Svg,
	emojiEmoticonSad4Svg,
	cryEmojiEmoticonSvg,
	emojiEmoticonHappy4Svg,
	emojiEmoticonSadSvg,
	emojiEmoticonSleepSvg,
];

export default function NotFound() {
	const [selectedSvg, setSelectedSvg] = useState(null);

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * svgs.length);
		setSelectedSvg(svgs[randomIndex]);
	}, []);

	return (
		<div className="not-found">
			<h1>404 . Page Not Found</h1>
			{selectedSvg && <img src={selectedSvg} alt="Not Found" />}
		</div>
	);
}
