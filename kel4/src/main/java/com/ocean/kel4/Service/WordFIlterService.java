package com.ocean.kel4.Service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

@Service
class WordFilterService {

    private static final Set<String> KATA_TERLARANG = new HashSet<>(Arrays.asList(
        "anjing", "babi", "bangsat", "bajingan", "brengsek",
        "celaka", "sialan", "kampret", "kurangajar",
        "goblok", "tolol", "idiot", "bodoh", "dungu",
        "bego", "bacot", "tai", "tahi", "setan",
        "laknat", "sundala", "jahanam", "monyet",
        "kontol", "memek", "ngentot", "jancok", "asu",
        "cuki", "pepek", "ndasmu",
        "fuck", "shit", "damn", "ass", "bitch",
        "bastard", "crap", "stupid", "moron",
        "hell", "dick", "pussy", "cock", "whore"
    ));

    public boolean mengandungKataTerlarang(String teks) {
        if (teks == null || teks.isBlank()) return false;
        String teksLower = teks.toLowerCase().replaceAll("[^a-z0-9\\s]", "");
        for (String kata : KATA_TERLARANG) {
            Pattern p = Pattern.compile("\\b" + Pattern.quote(kata) + "\\b");
            if (p.matcher(teksLower).find()) return true;
        }
        return false;
    }

    public String sensorTeks(String teks) {
        if (teks == null || teks.isBlank()) return teks;
        String hasil = teks;
        for (String kata : KATA_TERLARANG) {
            String bintang = "*".repeat(kata.length());
            hasil = hasil.replaceAll(
                "(?i)\\b" + Pattern.quote(kata) + "\\b",
                bintang
            );
        }
        return hasil;
    }
}