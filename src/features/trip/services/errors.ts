export class TripNotFoundError extends Error {
  constructor() {
    super("Trip tidak ditemukan");
    this.name = "TripNotFoundError";
  }
}

export class TripForbiddenError extends Error {
  constructor(message = "Anda tidak memiliki akses ke trip ini") {
    super(message);
    this.name = "TripForbiddenError";
  }
}
