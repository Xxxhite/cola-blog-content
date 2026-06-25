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
        id: "edu-shenzhen-senior-high",
        title: "深圳高级中学",
        description: "是一段难忘的时光...",
        type: "education",
        startDate: "2020-09-01",
        endDate: "2023-06-11",
        location: "深圳",
        organization: "深圳高级中学",
        icon: "material-symbols:school",
        color: "#1890ff",
    }
];
