// 友情链接数据配置
// 用于管理友情链接页面的数据

export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;    // 必须是以协议开头的网址
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
	{
		id: 1,
		title: "Astro",
		imgurl: "https://avatars.githubusercontent.com/u/44914786?v=4&s=640",
		desc: "The web framework for content-driven websites",
		siteurl: "https://github.com/withastro/astro",
		tags: ["Framework"],
	},
	{
		id: 2,
		title: "Mizuki Docs",
		imgurl:
			"https://q.qlogo.cn/headimg_dl?dst_uin=3231515355&spec=640&img_type=jpg",
		desc: "Mizuki User Manual",
		siteurl: "https://docs.mizuki.mysqil.com",
		tags: ["Docs"],
	},
    {
        id: 3,
        title: "TEST",
        imgurl:
            "",
        desc: "Test",
        siteurl: "https://www.test.com",
        tags: ["Test"],
    },
    {
        id: 4,
        title: "香香的记事终端",
        imgurl:
            "https://pages.rosmontis.love/images/fav512.webp",
        desc: "我想她需要一个记录器。我会给她造一台终端，方便输入的那种。这样她就能时常翻阅记录，去重新挖掘出她想要的那些场景和词句，让她的情感重新回归她脑中的事实，规整起来。像是把台词还给电影。",
        siteurl: "http://pages.rosmontis.love",
        tags: ["Friends"],
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
