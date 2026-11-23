#import <AVFoundation/AVFoundation.h>
#import <notify.h>
#import <unistd.h>

// Let Launch Services finish the key action immediately, even during playback.
int main(int argc, const char **argv) {
    if (fork() != 0) return 0;
    @autoreleasepool {
        const char *channel = "com.milbird.armada.stop-cue";
        notify_post(channel);
        NSString *sample = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"ArmadaSample"];
        if (!sample.length) return 0;
        int token, changed;
        if (notify_register_check(channel, &token) != NOTIFY_STATUS_OK) return 1;
        notify_check(token, &changed);
        NSString *root = @"/Applications/iMovie.app/Contents/Resources/iLife Sound Effects";
        NSURL *url = [NSURL fileURLWithPath:[root stringByAppendingPathComponent:sample]];
        AVAudioPlayer *player = [[AVAudioPlayer alloc] initWithContentsOfURL:url error:nil];
        player.volume = 0.55;
        if (![player play]) return 1;
        while (player.playing) {
            usleep(15000);
            notify_check(token, &changed);
            if (changed) [player stop];
        }
        notify_cancel(token);
    }
    return 0;
}
