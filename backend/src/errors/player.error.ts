export class PlayerNotFoundError extends Error {
    constructor(message = 'Player not found') {
        super(message);
        this.name = 'PlayerNotFoundError';
    }
}
