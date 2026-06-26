export interface TimelineItem {
    id: string;
    title: string;
    description: string;
    type: "education" | "work" | "project" | "achievement";
    startDate: string;
    endDate?: string;
    location?: string;
    organization?: string;
    position?: string;
    skills?: string[];
    achievements?: string[];
    links?: {
        name: string;
        url: string;
        type: "website" | "certificate" | "project" | "other";
    }[];
    icon?: string;
    color?: string;
    featured?: boolean;
}

export const timelineData: TimelineItem[] = [
    {
        id: "edu-senior-high",
        title: "高中阶段",
        description: "是一段难忘的时光...",
        type: "education",
        startDate: "2020-09-01",
        endDate: "2023-06-11",
        location: "深圳",
        organization: "深圳高级中学",
        icon: "material-symbols:school",
        color: "#1890ff",
    },
    {
        id: "edu-collage",
        title: "大学阶段",
        description: "努力中",
        type: "education",
        startDate: "2023-09-01",
        location: "杭州",
        organization: "浙江理工大学",
        icon: "material-symbols:school",
        color: "#1890ff",
    },
    {
        id: "cola-blog",
        title: "我的个人博客",
        description: "绝赞完成了，正在努力维护中",
        type: "project",
        startDate: "2026-06-27",
        links: [{
            name: "一罐可乐",
            url: "https://blog.sopak.space",
            type: "website"
        }],
        icon: "tdesign:cola-filled",
        color: "#F5222D"
    }
];
