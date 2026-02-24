import { ObservationModel } from "./observation.model";

export class ObservationReadingModel {
  private observationReadingId: number
  private readingId: number
  private observation: ObservationModel

  constructor(observationReadingId: number, readingId: number, observation: ObservationModel) {
    this.observationReadingId = observationReadingId;
    this.readingId = readingId;
    this.observation = observation;
  }

  public getObservationReadingId(): number {
    return this.observationReadingId;
  }

  public getReadingId(): number {
    return this.readingId;
  }

  public getObservation(): ObservationModel {
    return this.observation;
  }

  public setObservationReadingId(observationReadingId: number): void {
    this.observationReadingId = observationReadingId;
  }

  public setReading(readingId: number): void {
    this.readingId = readingId;
  }

  public setObservation(observation: ObservationModel): void {
    this.observation = observation;
  }
}