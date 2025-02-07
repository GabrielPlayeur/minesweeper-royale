export class MatchNotFoundError extends Error {
    constructor(message = 'Match not found') {
        super(message);
        this.name = 'MatchNotFoundError';
    }
}

export class NoMatchAssignedError extends Error {
    constructor(message = 'Player has no match assigned') {
        super(message);
        this.name = 'NoMatchAssignedError';
    }
}

export class PlayerAlreadyInMatchError extends Error {
    constructor(message = 'Player is already in a match') {
        super(message);
        this.name = 'PlayerAlreadyInMatchError';
    }
}

export class PlayerNotInMatchError extends Error {
    constructor(message = 'Player is not in the select match') {
        super(message);
        this.name = 'PlayerNotInMatchError';
    }
}
