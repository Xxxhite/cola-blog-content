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
		date: "2026-06-26T05:12:10+08:00",
	},
    {
        id: 2,
        content:
            "c拿下！以为是什么结果是个小问题，感恩hxd激情援助，至此也算是能用了。",
        date: "2026-06-27T03:07:08+08:00"
    }
];

// 获取日记列表（按时间倒序）
export const getDiaryList = (limit?: number) => {
	const sortedData = [...diaryData].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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
