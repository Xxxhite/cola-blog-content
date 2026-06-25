// 设备数据配置文件

export interface Device {
	name: string;
	image: string;
	specs: string;
	description: string;
	link: string;
}

// 设备类别类型，支持品牌和自定义类别
export type DeviceCategory = Record<string, Device[]> & {
	自定义?: Device[];
};

export const devicesData: DeviceCategory = {
	TEST: [
		{
			name: "test",
			image: "/images/device/oneplus13t.webp",
			specs: "114514",
			description: "test",
			link: "https://www.oneplus.com/cn/13t",
		},
	],
};
