// 日记数据配置
// 用于管理日记页面的数据

export interface DiaryItem {
	id: number;
	content: string;
	date: string;
	images?: string[];
	location?: string;
	mood?: string;
	tags?: string[];
}

// 示例日记数据
const diaryData: DiaryItem[] = [
	{
		id: 1,
		content:
			"随便写点东西放在这里，调这个配置实在是太累人了，啥时候能搞完我说。",
		date: "2026-06-26 05:12:10",
        mood: "🙃",
        tags: ["呟き"]
	},
    {
        id: 2,
        content:
            "c拿下！以为是什么结果是个小问题，感恩hxd激情援助，至此也算是能用了。",
        date: "2026-06-27 03:07:08",
        mood: "🥰",
        tags: ["呟き"]
    },
    {
        id: 3,
        content:
            "bw票抢到了有感觉吗",
        date: "2026-06-27 12:15:00",
        images: ["/images/diary/3.jpg"],
        mood: "🥰",
        tags: ["呟き"]
    },
    {
        id: 4,
        content:
            "距离上次起床已经38个小时了……",
        date: "2026-06-28 00:00:00",
        mood: "🥱",
        tags: ["呟き"]
    },
    {
        id: 5,
        content:
            "期末考试你在无差别的攻击所有人！",
        date: "2026-06-30 00:10:44",
        images: ["/images/diary/5.jpg"],
        mood: "😡",
        tags: ["呟き"]
    }
];

// 获取日记列表（按时间倒序）
// @ts-ignore
import { parseDateWithSiteTimezone } from "@utils/date-utils";

export const getDiaryList = (limit?: number) => {
    const sortedData = [...diaryData].sort(
        (a, b) => parseDateWithSiteTimezone(b.date).getTime() - parseDateWithSiteTimezone(a.date).getTime(),
    );

    if (limit && limit > 0) {
        return sortedData.slice(0, limit);
    }

    return sortedData;
};

// 获取所有标签
export const getAllTags = () => {
	// @ts-ignore
    const tags = new Set<string>();
	for (const item of diaryData) {
		if (item.tags) {
			for (const tag of item.tags) {
				tags.add(tag);
			}
		}
	}
	// @ts-ignore
    return Array.from(tags).sort();
};
