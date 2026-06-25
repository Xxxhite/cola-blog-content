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

];
