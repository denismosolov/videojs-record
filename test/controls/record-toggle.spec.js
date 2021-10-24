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

    it('accept interaction: countdown', (done) => {
        // create an instance of a player with the countdown
        player.dispose();
        player = TestHelpers.makeAudioVideoPlayer({
            plugins: {
                record: {
                    countdown: [
                        {value: '2', time: 1000},
                        {value: '1', time: 1000},
                    ]
                }
            }
        });

        let toggle = new RecordToggle(player);

        player.one(Event.DEVICE_READY, () => {
            // start
            toggle.trigger('click');
            expect(player.record().isPrerecording()).toBeTrue();
            expect(player.record().isRecording()).toBeTrue();

            setTimeout(() => {
                // stop
                toggle.trigger('click');
                expect(player.record().isPrerecording()).toBeFalse();
                expect(player.record().isRecording()).toBeFalse();

                done();
            }, 1000);
        });

        player.one(Event.READY, () => {
            player.record().getDevice();
        });
    });
});