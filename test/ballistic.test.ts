import { Ballistics } from '../src/ballistics';
import { Logger } from '../src/logging';

describe('Test', () => {

  let ballistics = new Ballistics();

  function simulate() {
    Logger.println(1);
    Logger.log('----------------');
    let result = ballistics.calculate();
    if (result == null) {
      Logger.log('SIMULATION FAILED');
    } else {
      Logger.log('CARGO FALL DURATION ' + result.fallDuration + ' seconds');
      Logger.log('CARGO HORIZONTAL DISTANCE TRAVELLED ' + result.horizontalDistance + ' meters');
      Logger.log('CARGO FINAL FALL SPEED ' + result.finalFallSpeed + ' m/s');
      Logger.log('CARGO FINAL HORIZONTAL SPEED ' + result.finalHorizontalVelocity + ' m/s');
      Logger.log('SIMULATION ROUNDS ' + result.simulationRounds);
    }
    Logger.log('----------------');
  }

  test('Real', async () => {
    // DRONE CONDITION
    ballistics.droneAltitude = 500;
    ballistics.droneVerticalVelocity = 0;
    ballistics.droneHorizontalVelocity = 10;
    ballistics.cargoSizeCm = 10;
    ballistics.cargoWeight = 1.5;
    Logger.log('DRONE ALTITUDE ' + ballistics.droneAltitude + ' meters');
    Logger.log('DRONE VELOCITY ' + ballistics.droneHorizontalVelocity + ' m/s');
    Logger.log('DRONE VERTICAL SPEED ' + ballistics.droneVerticalVelocity + ' m/s');
    // LET'S GO
    simulate()
  });

});