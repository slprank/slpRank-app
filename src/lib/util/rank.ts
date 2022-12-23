import type { User } from "./types";

export function getPlayerRank (rating: number, regionalPlacement: number) {
    switch (true) {
        case rating < 766:
            return 'BRONZE 1';
        case rating < 914:
            return 'BRONZE 2';
        case rating < 1055:
            return 'BRONZE 3';
        case rating < 1189:
            return 'SILVER 1';
        case rating < 1316:
            return 'SILVER 2';
        case rating < 1436:
            return 'SILVER 3';
        case rating < 1549:
            return 'GOLD 1';
        case rating < 1654:
            return 'GOLD 2';
        case rating < 1752:
            return 'GOLD 3';
        case rating < 1843:
            return 'PLATINUM 1';
        case rating < 1928:
            return 'PLATINUM 2';
        case rating < 2004:
            return 'PLATINUM 3';
        case rating < 2074:
            return 'DIAMOND 1';
        case rating < 2137:
            return 'DIAMOND 2';
        case rating < 2192:
            return 'DIAMOND 3';
        case rating < 2275 && regionalPlacement > 50:
            return 'MASTER 1';
        case rating < 2350 && regionalPlacement > 50:
            return 'MASTER 2';
        case rating >= 2350 && regionalPlacement > 50:
            return 'MASTER 3';
        case rating >= 2192 && regionalPlacement <= 50:
            return 'GRANDMASTER';
        default:
            return 'NONE';
    }
}