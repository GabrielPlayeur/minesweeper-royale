export class GameNotFoundError extends Error {
    constructor(message = 'Game not found') {
        super(message);
        this.name = 'GameNotFoundError';
    }
}
