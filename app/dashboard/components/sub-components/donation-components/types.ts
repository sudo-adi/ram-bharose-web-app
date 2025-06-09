export interface Donation {
    id: string;
    user_id: string;
    amount: number;
    description: string;
    cause: string;
    collected_amount: number;
    open_till: string;
    submitted_at: string;
    image_url?: string;
}
