import { Logger } from './logging';

const G: number = 9.80665;
// https://www.google.com/search?q=air+density+near+sea+level
const AIR_DESTINY = 1.225;
const SIMULATION_ROUNDS_LIMIT = 1000;

export class Ballistics {

  // CARGO CHARACTERISTICS
  /** Cargo weight, kilograms */
  cargoWeight: number = 1.0;
  /** Cargo size, centimeters */
  cargoSizeCm: number = 10;
  /** Cargo drag coefficient */
    // https://en.wikipedia.org/wiki/Drag_coefficient
  cargoDragCoefficientVertical: number = 0.75;
  cargoDragCoefficientHorizontal: number = 0.75;

  // DRONE CONDITIONS
  /** Drone horizontal speed, meters per second */
  droneHorizontalVelocity: number = 0;
  /** Drone vertical speed, meters per second */
  droneVerticalVelocity: number = 0;
  /** Drone altitude, meters */
  droneAltitude: number = 0;

  // calculation variables
  private calculationIntervalSeconds: number;
  private cargoSize: number;
  private crossSectionalAreaM2: number;
  private dragFactorHorizontal: number;
  private dragFactorVertical: number;
  private distanceFallen: number;
  private horizontalDistanceTravelled: number;
  private simulationRounds: number;
  private simulationTime: number;
  private verticalVelocity: number;
  private horizontalVelocity: number;
  private verticalVelocitySquared: number;
  private verticalAirResistanceForce: number;
  private verticalAirResistanceAcceleration: number;
  private horizontalVelocitySquared: number;
  private horizontalAirResistanceForce: number;
  private horizontalAirResistanceAcceleration: number;

  calculate(): {
    /** Time until reaching ground */
    fallDuration: number,
    /** Distance further the drone where "cargo" will land */
    horizontalDistance: number
    /** Speed at the ground */
    finalFallSpeed: number
    /** Horizontal speed at the ground */
    finalHorizontalVelocity: number
    /** Number of rounds during simulation */
    simulationRounds: number
  } {
    if (this.droneAltitude < 100) {
      this.calculationIntervalSeconds = 0.01;
    } else if (this.droneAltitude < 200) {
      this.calculationIntervalSeconds = 0.02;
    } else if (this.droneAltitude < 400) {
      this.calculationIntervalSeconds = 0.03;
    } else if (this.droneAltitude < 1000) {
      this.calculationIntervalSeconds = 0.04;
    } else {
      this.calculationIntervalSeconds = 0.05;
    }

    // convert to meters
    this.cargoSize = this.cargoSizeCm / 100;
    this.crossSectionalAreaM2 = this.cargoSize * this.cargoSize; // cargoSize squared

    // https://www.google.com/search?q=air+resistance+formula
    this.dragFactorHorizontal = 0.5 * AIR_DESTINY * this.cargoDragCoefficientVertical * this.crossSectionalAreaM2;
    this.dragFactorVertical = 0.5 * AIR_DESTINY * this.cargoDragCoefficientHorizontal * this.crossSectionalAreaM2;
    // air resistance force at the moment
    // airResistanceForce = verticalVelocity^2 * dragFactor

    // airResistanceAcceleration = airResistanceForce / this.cargoWeight
    // gravityAcceleration = G
    // overallAcceleration = gravityAcceleration - airResistanceAcceleration

    this.distanceFallen = 0;
    this.horizontalDistanceTravelled = 0;
    this.simulationTime = 0;
    this.verticalVelocity = -this.droneVerticalVelocity; // negative as cargo is falling down
    this.horizontalVelocity = this.droneHorizontalVelocity;
    this.simulationRounds = 0;
    while (this.simulationRounds < SIMULATION_ROUNDS_LIMIT && this.distanceFallen < this.droneAltitude) {
      this.simulationTime += this.calculationIntervalSeconds;
      // vertical fall down
      this.verticalVelocity += G * this.calculationIntervalSeconds;
      this.verticalVelocitySquared = this.verticalVelocity * this.verticalVelocity;
      this.verticalAirResistanceForce = this.verticalVelocitySquared * this.dragFactorHorizontal;
      this.verticalAirResistanceAcceleration = this.verticalAirResistanceForce / this.cargoWeight;
      this.verticalVelocity -= (this.verticalAirResistanceAcceleration * this.calculationIntervalSeconds);
      this.distanceFallen += (this.verticalVelocity * this.calculationIntervalSeconds);
      // horizontal movement
      this.horizontalVelocitySquared = this.horizontalVelocity * this.horizontalVelocity;
      this.horizontalAirResistanceForce = this.horizontalVelocitySquared * this.dragFactorVertical;
      this.horizontalAirResistanceAcceleration = this.horizontalAirResistanceForce / this.cargoWeight;
      this.horizontalVelocity -= (this.horizontalAirResistanceAcceleration * this.calculationIntervalSeconds);
      this.horizontalDistanceTravelled += (this.horizontalVelocity * this.calculationIntervalSeconds);
      this.simulationRounds++;
    }
    if (this.simulationRounds >= SIMULATION_ROUNDS_LIMIT) {
      // handle it as no info
      Logger.log('SIMULATION TIME ' + this.simulationTime + ' seconds');
      Logger.log('SIMULATION VERTICAL DISTANCE ' + this.distanceFallen);
      return null;
    }
    return {
      fallDuration: this.simulationTime,
      horizontalDistance: this.horizontalDistanceTravelled,
      finalFallSpeed: this.verticalVelocity,
      finalHorizontalVelocity: this.horizontalVelocity,
      simulationRounds: this.simulationRounds,
    };
  }

}