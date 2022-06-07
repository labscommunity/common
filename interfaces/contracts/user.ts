export interface UserInterface {
    username: string;
    name: string;
    addresses: string[];
    image?: string;
    bio?: string;
    links?: {
        [identifier: string]: string;
    };
}
