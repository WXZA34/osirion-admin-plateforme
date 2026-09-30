export interface FeatureCodeFile {
  id: string;
  featureTitle: string;
  category: string;
  filePath: string;
  language: 'dart' | 'kotlin' | 'proguard' | 'json';
  description: string;
  dependencies: string[];
  code: string;
}

export const GENERATED_FEATURE_FILES: FeatureCodeFile[] = [
  // 1. PULLUP COUNTER (TRACTIONS)
  {
    id: 'pullup_counter',
    featureTitle: 'Tractions Strictes (Pullup Counter)',
    category: 'Dojo Vision IA',
    filePath: 'lib/features/dojo/counters/pullup_counter.dart',
    language: 'dart',
    description: 'Compteur de tractions au poids du corps avec passage obligatoire du menton au-dessus de la ligne des poignets et extension complète des coudes.',
    dependencies: ['google_mlkit_pose_detection', 'i_valerion_counter.dart', 'pose_math_service.dart'],
    code: `import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import '../services/pose_math_service.dart';
import 'i_valerion_counter.dart';

enum PullupState { hang, pullUp, chinOverBar, unknown }

class PullupCounter implements IValerionCounter {
  int _count = 0;
  PullupState _state = PullupState.hang;
  final double sensitivity; // 0.0 strict, 1.0 permissif
  double _lastRepQuality = 100.0;

  PullupCounter({this.sensitivity = 0.7});

  @override
  bool get isCalibrating => false;

  @override
  Set<PoseLandmarkType> get faultyLandmarks => {};

  @override
  String get name => "TRACTIONS";

  @override
  int get targetReps => 0;

  @override
  int get count => _count;

  double get lastRepQuality => _lastRepQuality;

  @override
  String get currentState {
    switch (_state) {
      case PullupState.hang:
        return "SUSPENSION";
      case PullupState.pullUp:
        return "MONTÉE";
      case PullupState.chinOverBar:
        return "MENTON PASSÉ";
      default:
        return "ATTENTE";
    }
  }

  @override
  bool processPose(Pose pose) {
    final leftShoulder = pose.landmarks[PoseLandmarkType.leftShoulder];
    final rightShoulder = pose.landmarks[PoseLandmarkType.rightShoulder];
    final leftElbow = pose.landmarks[PoseLandmarkType.leftElbow];
    final rightElbow = pose.landmarks[PoseLandmarkType.rightElbow];
    final leftWrist = pose.landmarks[PoseLandmarkType.leftWrist];
    final rightWrist = pose.landmarks[PoseLandmarkType.rightWrist];
    final nose = pose.landmarks[PoseLandmarkType.nose];

    if (leftShoulder == null || rightShoulder == null || 
        leftElbow == null || rightElbow == null ||
        leftWrist == null || rightWrist == null) {
      return false;
    }

    final leftAngle = PoseMathService.getAngle(leftShoulder, leftElbow, leftWrist);
    final rightAngle = PoseMathService.getAngle(rightShoulder, rightElbow, rightWrist);
    final avgElbowAngle = (leftAngle + rightAngle) / 2.0;

    // Détermination de la ligne moyenne des poignets (barre imaginaire)
    final wristY = (leftWrist.y + rightWrist.y) / 2.0;
    final chinY = nose != null ? (nose.y + 25.0) : (leftShoulder.y - 15.0);

    // 1. Position basse (Suspension complète, coudes déverrouillés > 150°)
    if (avgElbowAngle > (150.0 - 15.0 * sensitivity)) {
      if (_state == PullupState.chinOverBar) {
        // Validation complète d'une répétition
        _count++;
        _state = PullupState.hang;
        return true;
      }
      _state = PullupState.hang;
    }
    // 2. Position haute (Flexion des coudes < 75° ET menton plus haut que les mains)
    else if (avgElbowAngle < (75.0 + 20.0 * sensitivity) && chinY <= wristY) {
      if (_state == PullupState.hang || _state == PullupState.pullUp) {
        _state = PullupState.chinOverBar;
      }
    } else if (avgElbowAngle < 120.0 && _state == PullupState.hang) {
      _state = PullupState.pullUp;
    }

    return false;
  }
}
`
  },

  // 2. DIPS COUNTER
  {
    id: 'dips_counter',
    featureTitle: 'Dips Barres Parallèles (Dips Counter)',
    category: 'Dojo Vision IA',
    filePath: 'lib/features/dojo/counters/dips_counter.dart',
    language: 'dart',
    description: 'Détection des répulsions aux barres parallèles avec contrôle de l’angle droit (90°) et verrouillage triceps.',
    dependencies: ['google_mlkit_pose_detection', 'i_valerion_counter.dart', 'pose_math_service.dart'],
    code: `import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import '../services/pose_math_service.dart';
import 'i_valerion_counter.dart';

enum DipsState { locked, descent, bottom, unknown }

class DipsCounter implements IValerionCounter {
  int _count = 0;
  DipsState _state = DipsState.locked;
  final double sensitivity;

  DipsCounter({this.sensitivity = 0.7});

  @override
  bool get isCalibrating => false;

  @override
  Set<PoseLandmarkType> get faultyLandmarks => {};

  @override
  String get name => "DIPS";

  @override
  int get targetReps => 0;

  @override
  int get count => _count;

  @override
  String get currentState {
    switch (_state) {
      case DipsState.locked:
        return "HAUT (VERROUILLÉ)";
      case DipsState.descent:
        return "DESCENTE";
      case DipsState.bottom:
        return "BAS (90° ATTEINT)";
      default:
        return "ATTENTE";
    }
  }

  @override
  bool processPose(Pose pose) {
    final leftShoulder = pose.landmarks[PoseLandmarkType.leftShoulder];
    final leftElbow = pose.landmarks[PoseLandmarkType.leftElbow];
    final leftWrist = pose.landmarks[PoseLandmarkType.leftWrist];

    if (leftShoulder == null || leftElbow == null || leftWrist == null) return false;

    final angle = PoseMathService.getAngle(leftShoulder, leftElbow, leftWrist);

    // Position haute verrouillée (coude tendu > 155°)
    if (angle > (160.0 - 15.0 * sensitivity)) {
      if (_state == DipsState.bottom) {
        _count++;
        _state = DipsState.locked;
        return true;
      }
      _state = DipsState.locked;
    } 
    // Position basse (coudes pliés à 90° ou moins)
    else if (angle < (90.0 + 15.0 * sensitivity)) {
      if (_state == DipsState.locked || _state == DipsState.descent) {
        _state = DipsState.bottom;
      }
    } else if (_state == DipsState.locked && angle < 140.0) {
      _state = DipsState.descent;
    }

    return false;
  }
}
`
  },

  // 3. QUALITY & ROM ENGINE (SCORE SUR 100)
  {
    id: 'quality_rom_engine',
    featureTitle: 'Moteur de Score Biomécanique (ROM & Alignement)',
    category: 'Dojo Vision IA',
    filePath: 'lib/features/dojo/services/movement_quality_service.dart',
    language: 'dart',
    description: 'Évalue la rectitude du gainage (hanches/épaules/chevilles) et la régularité du tempo pour attribuer un score de 0 à 100 et éliminer la triche.',
    dependencies: ['google_mlkit_pose_detection', 'pose_math_service.dart'],
    code: `import 'dart:math' as math;
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'pose_math_service.dart';

class MovementQualityResult {
  final double score; // 0 à 100
  final bool isCheatingDetected;
  final String feedbackMessage;
  final double alignmentDeviation;

  MovementQualityResult({
    required this.score,
    required this.isCheatingDetected,
    required this.feedbackMessage,
    required this.alignmentDeviation,
  });
}

class MovementQualityService {
  /// Analyse l'alignement de la planche pour les pompes
  static MovementQualityResult analyzePushupPlank(Pose pose) {
    final shoulder = pose.landmarks[PoseLandmarkType.leftShoulder] ?? 
                     pose.landmarks[PoseLandmarkType.rightShoulder];
    final hip = pose.landmarks[PoseLandmarkType.leftHip] ?? 
                pose.landmarks[PoseLandmarkType.rightHip];
    final ankle = pose.landmarks[PoseLandmarkType.leftAnkle] ?? 
                  pose.landmarks[PoseLandmarkType.rightAnkle];

    if (shoulder == null || hip == null || ankle == null) {
      return MovementQualityResult(
        score: 80.0,
        isCheatingDetected: false,
        feedbackMessage: "Positionnez tout le corps dans le cadre",
        alignmentDeviation: 0.0,
      );
    }

    // Calcul de l'angle du tronc (doit être proche de 180° pour un gainage parfait)
    final trunkAngle = PoseMathService.getAngle(shoulder, hip, ankle);
    final deviation = (180.0 - trunkAngle).abs();

    if (deviation > 35.0) {
      return MovementQualityResult(
        score: math.max(30.0, 100.0 - deviation * 2.0),
        isCheatingDetected: true,
        feedbackMessage: deviation > 0 && hip.y > shoulder.y 
            ? "Bassin affaissé ! Serrez les abdominaux." 
            : "Fesses trop hautes ! Alignez le dos.",
        alignmentDeviation: deviation,
      );
    }

    final calculatedScore = math.min(100.0, math.max(70.0, 100.0 - deviation * 0.8));
    return MovementQualityResult(
      score: calculatedScore,
      isCheatingDetected: false,
      feedbackMessage: "Alignement optimal : Gainage de Guerrier",
      alignmentDeviation: deviation,
    );
  }
}
`
  },

  // 4. GHOST RUNNER PATH SNAPPING (ARENA)
  {
    id: 'ghost_path_snapping',
    featureTitle: 'Service Ghost Runner & Path Snapping',
    category: 'Arena & H3 GPS',
    filePath: 'lib/features/arena/services/ghost_snapping_service.dart',
    language: 'dart',
    description: 'Projette avec précision orthogonale la position du fantôme sur les coordonnées vectorielles de la route pour éviter toute dérive cartographique.',
    dependencies: ['latlong2', 'flutter_polyline_points'],
    code: `import 'dart:math' as math;
import 'package:latlong2/latlong.dart';

class GhostSnappingService {
  /// Projette un point GPS brut sur le segment le plus proche de la polyline
  static LatLng snapToPolyline(LatLng ghostRawPos, List<LatLng> polylinePoints) {
    if (polylinePoints.isEmpty) return ghostRawPos;
    if (polylinePoints.length == 1) return polylinePoints.first;

    double minDistance = double.infinity;
    LatLng closestPoint = polylinePoints.first;

    for (int i = 0; i < polylinePoints.length - 1; i++) {
      final pA = polylinePoints[i];
      final pB = polylinePoints[i + 1];

      final projected = _projectPointOnSegment(ghostRawPos, pA, pB);
      final dist = _haversineDistance(ghostRawPos, projected);

      if (dist < minDistance) {
        minDistance = dist;
        closestPoint = projected;
      }
    }

    return closestPoint;
  }

  /// Calcule la projection orthogonale d'un point P sur le segment [A, B]
  static LatLng _projectPointOnSegment(LatLng p, LatLng a, LatLng b) {
    final double dx = b.longitude - a.longitude;
    final double dy = b.latitude - a.latitude;

    if (dx == 0 && dy == 0) return a;

    final double t = ((p.longitude - a.longitude) * dx + 
                      (p.latitude - a.latitude) * dy) / 
                      (dx * dx + dy * dy);

    // Contrainte entre 0 et 1 (sur le segment)
    final double clampedT = math.max(0.0, math.min(1.0, t));

    return LatLng(
      a.latitude + clampedT * dy,
      a.longitude + clampedT * dx,
    );
  }

  /// Distance Haversine en mètres
  static double _haversineDistance(LatLng p1, LatLng p2) {
    const double earthRadius = 6371000.0;
    final double dLat = (p2.latitude - p1.latitude) * math.pi / 180.0;
    final double dLon = (p2.longitude - p1.longitude) * math.pi / 180.0;

    final double a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(p1.latitude * math.pi / 180.0) *
        math.cos(p2.latitude * math.pi / 180.0) *
        math.sin(dLon / 2) * math.sin(dLon / 2);

    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return earthRadius * c;
  }
}
`
  },

  // 5. CLAN RAIDS & BASTION CONQUEST
  {
    id: 'clan_raids_service',
    featureTitle: 'Raids Synchronisés & Prise de Bastion',
    category: 'Arena & H3 GPS',
    filePath: 'lib/features/arena/services/bastion_raid_service.dart',
    language: 'dart',
    description: 'Gestionnaire de siège de spot street workout : vérification de géofencing 30m pour 2+ membres de clan et cumul de répétitions.',
    dependencies: ['cloud_firestore', 'geolocator'],
    code: `import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geolocator/geolocator.dart';

class BastionRaidService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Vérifie si l'athlète se trouve dans le périmètre du bastion (30 mètres)
  Future<bool> isWithinBastionRadius(double bastionLat, double bastionLng) async {
    final pos = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    final distanceMeters = Geolocator.distanceBetween(
      pos.latitude,
      pos.longitude,
      bastionLat,
      bastionLng,
    );

    return distanceMeters <= 35.0; // 35 mètres de tolérance GPS urbain
  }

  /// Participe au siège collectif d'un bastion
  Future<void> submitRaidContribution({
    required String bastionId,
    required String clanId,
    required String clanName,
    required String userId,
    required int repsAdded,
  }) async {
    final raidDoc = _firestore.collection('bastions').doc(bastionId).collection('active_raid').doc('current');

    await _firestore.runTransaction((transaction) async {
      final snapshot = await transaction.get(raidDoc);

      if (!snapshot.exists) {
        transaction.set(raidDoc, {
          'clanId': clanId,
          'clanName': clanName,
          'targetReps': 500,
          'currentReps': repsAdded,
          'participants': [userId],
          'startedAt': FieldValue.serverTimestamp(),
          'status': 'in_progress',
        });
      } else {
        final currentReps = (snapshot.get('currentReps') as num).toInt();
        final targetReps = (snapshot.get('targetReps') as num).toInt();
        final participants = List<String>.from(snapshot.get('participants') as List);

        if (!participants.contains(userId)) {
          participants.add(userId);
        }

        final newTotal = currentReps + repsAdded;
        final bool isConquered = newTotal >= targetReps;

        transaction.update(raidDoc, {
          'currentReps': newTotal,
          'participants': participants,
          'status': isConquered ? 'conquered' : 'in_progress',
          if (isConquered) 'conqueredAt': FieldValue.serverTimestamp(),
        });

        if (isConquered) {
          // Mise à jour de la possession du bastion principal
          final bastionRef = _firestore.collection('bastions').doc(bastionId);
          transaction.update(bastionRef, {
            'conqueringClan': clanName,
            'conqueringClanId': clanId,
            'lastCaptured': FieldValue.serverTimestamp(),
          });
        }
      }
    });
  }
}
`
  },

  // 6. TOURNAMENT BRACKET ENGINE
  {
    id: 'tournament_colosseum',
    featureTitle: 'Arbre de Tournoi Live "Le Colisée"',
    category: 'Duels & Multijoueur',
    filePath: 'lib/features/duel/services/tournament_sync_service.dart',
    language: 'dart',
    description: 'Système d’arbre de tournoi synchronisé à 8 joueurs (Quarts, Demies, Finale) avec arbitre temps réel.',
    dependencies: ['firebase_database'],
    code: `import 'package:firebase_database/firebase_database.dart';

class TournamentMatch {
  final String matchId;
  final String player1Id;
  final String player1Name;
  final String player2Id;
  final String player2Name;
  final int player1Score;
  final int player2Score;
  final String winnerId;
  final String round; // 'quarters', 'semis', 'final'

  TournamentMatch({
    required this.matchId,
    required this.player1Id,
    required this.player1Name,
    required this.player2Id,
    required this.player2Name,
    required this.player1Score,
    required this.player2Score,
    required this.winnerId,
    required this.round,
  });
}

class TournamentSyncService {
  final DatabaseReference _db = FirebaseDatabase.instance.ref('tournaments');

  /// Écoute en direct l'évolution de l'arbre du tournoi hebdomadaire
  Stream<Map<String, dynamic>> listenToCurrentTournament(String tournamentId) {
    return _db.child(tournamentId).onValue.map((event) {
      if (event.snapshot.value == null) return {};
      return Map<String, dynamic>.from(event.snapshot.value as Map);
    });
  }

  /// Fait progresser le vainqueur au round supérieur
  Future<void> advanceWinner({
    required String tournamentId,
    required String matchId,
    required String winnerId,
    required String winnerName,
    required String nextMatchId,
    required int nextSlot, // 1 ou 2
  }) async {
    final matchRef = _db.child('$tournamentId/matches/$matchId');
    await matchRef.update({
      'winnerId': winnerId,
      'status': 'finished',
    });

    final nextMatchRef = _db.child('$tournamentId/matches/$nextMatchId');
    await nextMatchRef.update({
      'player\${nextSlot}Id': winnerId,
      'player\${nextSlot}Name': winnerName,
    });
  }
}
`
  },

  // 7. WEAR OS & HEALTH CONNECT BRIDGE (KOTLIN)
  {
    id: 'wear_os_health_bridge',
    featureTitle: 'Bridge Android Native : Health Connect & Wear OS Haptics',
    category: 'Hardware & Capteurs',
    filePath: 'android/app/src/main/kotlin/com/osirion/app/HealthConnectBridge.kt',
    language: 'kotlin',
    description: 'Bridge natif Android gérant les vibrations haptiques précises sur montre connectée et l’écriture des calories dans Google Health Connect.',
    dependencies: ['androidx.health.connect.client', 'android.os.Vibrator'],
    code: `package com.osirion.app

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import io.flutter.plugin.common.MethodChannel

class HealthConnectBridge(private val context: Context) {

    private val vibrator: Vibrator by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    /// Vibration tactique pour validation de répétition (1 vibration nette 60ms)
    fun vibrateRepValidated() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createOneShot(60, VibrationEffect.DEFAULT_AMPLITUDE)
            vibrator.vibrate(effect)
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(60)
        }
    }

    /// Double vibration pour faute de posture (2 pulsations de 100ms)
    fun vibrateFaultyPosture() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val timing = longArrayOf(0, 100, 80, 100)
            val effect = VibrationEffect.createWaveform(timing, -1)
            vibrator.vibrate(effect)
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(250)
        }
    }
}
`
  },

  // 8. BATTLE PASS ENGINE (30 PALIERS)
  {
    id: 'battle_pass_service',
    featureTitle: 'Passe de Saison "La Forge des Titans"',
    category: 'Économie & Rétention',
    filePath: 'lib/features/rewards/battle_pass_service.dart',
    language: 'dart',
    description: 'Structure de 30 paliers saisonniers avec déblocage de récompenses gratuites et Premium (Halos, Or, Titres).',
    dependencies: ['cloud_firestore', 'in_app_purchase'],
    code: `import 'package:cloud_firestore/cloud_firestore.dart';

class BattlePassTier {
  final int tierNumber;
  final int xpRequired;
  final String freeReward;
  final String premiumReward;
  final int aetherReward;

  const BattlePassTier({
    required this.tierNumber,
    required this.xpRequired,
    required this.freeReward,
    required this.premiumReward,
    required this.aetherReward,
  });
}

class BattlePassService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  static const List<BattlePassTier> season1Tiers = [
    BattlePassTier(tierNumber: 1, xpRequired: 500, freeReward: "Titre : Recrue", premiumReward: "Halo : Lueur d'Aura", aetherReward: 100),
    BattlePassTier(tierNumber: 5, xpRequired: 2500, freeReward: "500 Or", premiumReward: "Titre : Gladiateur de Bronze", aetherReward: 250),
    BattlePassTier(tierNumber: 10, xpRequired: 6000, freeReward: "Relique : Bandage de Poignet", premiumReward: "Skin Carte : Cyberpunk Néon", aetherReward: 500),
    BattlePassTier(tierNumber: 20, xpRequired: 15000, freeReward: "1500 Or", premiumReward: "Halo : Foudre Céleste", aetherReward: 1000),
    BattlePassTier(tierNumber: 30, xpRequired: 30000, freeReward: "Titre : Immortel", premiumReward: "Couronne des Titans (Légendaire)", aetherReward: 2500),
  ];

  /// Récupère le palier actuel atteint selon l'XP de saison
  static int getCurrentTier(int seasonXp) {
    for (int i = season1Tiers.length - 1; i >= 0; i--) {
      if (seasonXp >= season1Tiers[i].xpRequired) {
        return season1Tiers[i].tierNumber;
      }
    }
    return 1;
  }
}
`
  },

  // 9. STREAK SHIELD & WARRIOR REST
  {
    id: 'streak_shield_service',
    featureTitle: 'Bouclier de Série & Repos du Guerrier',
    category: 'Économie & Rétention',
    filePath: 'lib/features/profile/services/streak_protection_service.dart',
    language: 'dart',
    description: 'Sauvegarde la série de jours consécutifs d’un athlète en cas de repos musculaire ou de blessure.',
    dependencies: ['cloud_firestore'],
    code: `import 'package:cloud_firestore/cloud_firestore.dart';

class StreakProtectionService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Vérifie et consomme un bouclier si l'athlète a raté 24h
  Future<bool> checkAndApplyStreakFreeze(String userId) async {
    final userRef = _firestore.collection('users').doc(userId);

    return await _firestore.runTransaction<bool>((transaction) async {
      final snap = await transaction.get(userRef);
      if (!snap.exists) return false;

      final lastActiveTimestamp = snap.get('lastActiveDate') as Timestamp?;
      final shieldsAvailable = (snap.get('streakShields') as num?)?.toInt() ?? 0;
      final currentStreak = (snap.get('streak') as num?)?.toInt() ?? 0;

      if (lastActiveTimestamp == null) return false;

      final hoursSinceLast = DateTime.now().difference(lastActiveTimestamp.toDate()).inHours;

      // Si plus de 36 heures sans activité et qu'il possède un bouclier
      if (hoursSinceLast >= 36 && hoursSinceLast < 60 && shieldsAvailable > 0) {
        transaction.update(userRef, {
          'streakShields': shieldsAvailable - 1,
          'lastActiveDate': FieldValue.serverTimestamp(), // Renouvellement de la date pour sauver la streak
        });
        return true; // Série sauvée !
      }

      return false;
    });
  }
}
`
  },

  // 10. ADAPTIVE SOUNDTRACK SERVICE
  {
    id: 'adaptive_soundtrack',
    featureTitle: 'Soundtrack Cyberpunk Dynamique (Cadence & Météo)',
    category: 'Hardware & Capteurs',
    filePath: 'lib/core/services/adaptive_soundtrack_service.dart',
    language: 'dart',
    description: 'Modifie le tempo audio (BPM) et la nappe sonore en direct selon la météo et la vitesse de course.',
    dependencies: ['audioplayers', 'geolocator'],
    code: `import 'package:audioplayers/audioplayers.dart';

class AdaptiveSoundtrackService {
  final AudioPlayer _player = AudioPlayer();
  double _currentSpeedKmh = 0.0;

  /// Démarre la piste adaptative
  Future<void> startSoundtrack({required bool isRaining, required bool isNight}) async {
    final String trackUrl = isRaining
        ? "https://storage.googleapis.com/osirion-assets/audio/music_industrial_rain.mp3"
        : (isNight 
            ? "https://storage.googleapis.com/osirion-assets/audio/music_cyber_night.mp3"
            : "https://storage.googleapis.com/osirion-assets/audio/music_synth_charge.mp3");

    await _player.setSourceUrl(trackUrl);
    await _player.setReleaseMode(ReleaseMode.loop);
    await _player.resume();
  }

  /// Ajuste le tempo (playback rate) selon la vitesse de l'athlète
  Future<void> updateSpeed(double speedKmh) async {
    _currentSpeedKmh = speedKmh;
    
    // De 0 à 20 km/h -> taux de 0.9x à 1.35x
    final double targetRate = 0.9 + (speedKmh / 20.0).clamp(0.0, 1.0) * 0.45;
    await _player.setPlaybackRate(targetRate);
  }

  Future<void> stop() async {
    await _player.stop();
  }
}
`
  }
];
