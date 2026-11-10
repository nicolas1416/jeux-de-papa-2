package com.jeuxdepapa2.jeu;

import android.content.Context;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Plein écran : masque la barre d'état et la barre de navigation (glisser depuis le bord pour les afficher)
// + petit module « PapaAudio » qui règle le volume média de la tablette (utilisé par la vidéo de bienvenue)
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PapaAudioPlugin.class);
        super.onCreate(savedInstanceState);
        hideSystemBars();
    }

    @Override
    public void onResume() {
        super.onResume();
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }

    @CapacitorPlugin(name = "PapaAudio")
    public static class PapaAudioPlugin extends Plugin {
        private AudioManager audio() {
            return (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        }

        // Volume média actuel : niveau brut et pourcentage
        @PluginMethod
        public void getVolume(PluginCall call) {
            try {
                AudioManager am = audio();
                int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC), cur = am.getStreamVolume(AudioManager.STREAM_MUSIC);
                JSObject r = new JSObject();
                r.put("level", cur);
                r.put("max", max);
                r.put("percent", Math.round(cur * 100f / Math.max(1, max)));
                call.resolve(r);
            } catch (Exception e) {
                call.reject("Volume illisible", e);
            }
        }

        // Règle le volume média : { percent: 50 } ou { level: 7 } (on réactive le son s'il était coupé)
        @PluginMethod
        public void setVolume(PluginCall call) {
            try {
                AudioManager am = audio();
                int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                Integer level = call.getInt("level");
                if (level == null) level = Math.max(1, Math.round(max * call.getInt("percent", 50) / 100f));
                if (Build.VERSION.SDK_INT >= 23 && level > 0) am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_UNMUTE, 0);
                am.setStreamVolume(AudioManager.STREAM_MUSIC, Math.min(max, Math.max(0, level)), 0);
                call.resolve();
            } catch (Exception e) {
                call.reject("Volume non modifiable", e);
            }
        }
    }
}
