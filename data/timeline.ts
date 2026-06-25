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
		id: "test",
		title: "test timeline",
		description:
			"test desc",
		type: "work",
		startDate: "2026-06-25",
		location: "?",
		organization: "test organization",
		skills: ["test skill"],
		achievements: [
			"1974年第一次在东南亚打自由搏击"
		],
		icon: "material-symbols:school",
		color: "#059669",
		featured: true,
	},
];
