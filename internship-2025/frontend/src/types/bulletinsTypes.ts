export interface BulletinImage {
    url: string;
    width: number;
    height: number;
}

export interface Bulletin {
    subject: string;
    info: string;
    "bulletin.id": number;
    "bulletin.views": string;
    "sell.priceNum": number;
    companyName: string;
    dateRelevance: number;
    images: BulletinImage[];
    delivery: number | null;
    "boatEngine.power.float"?: number;
    "boatEngine.legLength"?: string;
    "boatEngine.year"?: number;
    "boatEngine.fuelType"?: string;
    "boatEngine.cycleType"?: string;
    "boatEngine.control"?: string;
    "boatEngine.prop"?: string;
    "sell.condition": string;
    goodPresentState: string;
    "model.index": string;
    hasImages: boolean;
    
}

export interface BulletinsData {
    [categoryId: string]: Bulletin[];
}