export interface Category {
    id: string;
    title: string;
    active: boolean;
    seeAlso?: string[];
}