/**
 * @since 2.2.0
 */

import TestHelpers from '../test-helpers';

import Event from '../../src/js/event';
import RecordToggle from '../../src/js/controls/record-toggle';


/** @test {record-toggle} */
describe('controls.RecordToggle', () => {
    let player;

    beforeEach(() => {
        // create new player
        player = TestHelpers.makePlayer();
    });

    afterEach(() => {
        player.dispose();
    });

    it('creates the correct DOM element', () => {
        let toggle = new RecordToggle(player);

        expect(toggle.el().nodeName).toEqual('BUTTON');
        expect(toggle.on).toBeFunction();
        expect(toggle.enabled_).toBeTrue();
        expect(toggle.controlText_).toEqual('Record');

        let styleClasses = ['vjs-record-button', 'vjs-control', 'vjs-button',
            'vjs-icon-record-start'];
        styleClasses.forEach((e) => {
            expect(toggle.hasClass(e)).toBeTrue();
        });
    });

    it('can be disabled', (done) => {
        let toggle = new RecordToggle(player);

        player.one(Event.READY, () => {
            toggle.disable();
            expect(toggle.enabled_).toBeFalse();

            done();
        });
    });

    it('change appearance when startRecord or stopRecord is triggered', (done) => {
        let toggle = new RecordToggle(player);

        expect(toggle.hasClass('vjs-icon-record-start')).toBeTrue();

        player.one(Event.READY, () => {
            player.trigger(Event.START_RECORD);

            expect(toggle.hasClass('vjs-icon-record-start')).toBeFalse();
            expect(toggle.hasClass('vjs-icon-record-stop')).toBeTrue();
            expect(toggle.controlText_).toEqual('Stop');

            player.trigger(Event.STOP_RECORD);

            expect(toggle.hasClass('vjs-icon-record-stop')).toBeFalse();
            expect(toggle.hasClass('vjs-icon-record-start')).toBeTrue();
            expect(toggle.controlText_).toEqual('Record');

            done();
        });
    });

    it('accept interaction', (done) => {
        let toggle = new RecordToggle(player);

        player.one(Event.DEVICE_READY, () => {
            // start
            toggle.trigger('click');
            expect(player.record().isRecording()).toBeTrue();

            done();
        });

        player.one(Event.READY, () => {
            player.record().getDevice();
        });
    });

    it('record button is locked while the countdown is running', (done) => {
        // create an instance of a player with the countdown
        player.dispose();
        player = TestHelpers.makeAudioVideoPlayer({
            plugins: {
                record: {
                    countdownOverlay: true,
                    countdownSteps: 2,
                    countdownTimeBetweenSteps: 1000
                }
            }
        });

        let toggle = new RecordToggle(player);

        player.one(Event.DEVICE_READY, () => {
            // start
            toggle.trigger('click');

            setTimeout(() => {
                // countdown is running, record button is locked
                expect(toggle.el().hasAttribute('disabled')).toBeTrue();
            }, 1000);

            setTimeout(() => {
                // stop recording
                player.record().stop();
            }, 3000);
        });

        player.one(Event.FINISH_RECORD, () => {
            // wait till it's loaded before destroying
            // (XXX: create new event for this)
            setTimeout(done, 1000);
        });

        player.one(Event.READY, () => {
            player.record().getDevice();
        });
    });
});