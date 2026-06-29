// 友情链接数据配置
// 用于管理友情链接页面的数据

export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;       // 支持html标签，如用 <br> 换行
	siteurl: string;    // 必须是以协议开头的网址
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
    {
        id: 1,
        title: "三理Mit3uri",
        imgurl:
            "/images/friends/mit3uri.webp",
        desc: "个人的小私心，是一个很努力很努力的紫色小猪。<br>「 一起于梦境穿梭🔮 」",
        siteurl: "https://space.bilibili.com/2030198123",
        tags: ["🟣🐷"],
    },
    {
        id: 2,
        title: "香香的记事终端",
        imgurl:
            "https://pages.rosmontis.love/images/fav512.webp",
        desc: "我想她需要一个记录器。我会给她造一台终端，方便输入的那种。这样她就能时常翻阅记录，去重新挖掘出她想要的那些场景和词句，让她的情感重新回归她脑中的事实，规整起来。像是把台词还给电影。",
        siteurl: "http://pages.rosmontis.love",
        tags: ["Friends", "Blog"],
    },
    {
        id: 3,
        title: "滴墨",
        imgurl:
            "https://dimo.qwq6.xyz/dimo.svg",
        desc: "像雾，像雨，又像风。这里写代码、写电影、写一些半夜想通的小事 —— 慢慢沉淀，等你来读。",
        siteurl: "http://dimo.qwq6.xyz",
        tags: ["Friends", "Blog"],
    },
];

// 获取所有友情链接数据
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
