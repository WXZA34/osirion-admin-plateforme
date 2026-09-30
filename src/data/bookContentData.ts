export interface BookChapter {
  id: string;
  title: string;
  subtitle?: string;
  content: string[];
}

export interface BookFullContent {
  bookId: string;
  title: string;
  author: string;
  summary: string;
  pdfUrl?: string;
  chapters: BookChapter[];
}

export const BOOK_CONTENTS_DATABASE: Record<string, BookFullContent> = {
  b_aurele: {
    bookId: 'b_aurele',
    title: 'Pensées pour moi-même',
    author: 'Marc Aurèle',
    summary:
      'Les carnets personnels de l’empereur-philosophe romain, rédigés sur le front de guerre germanique. L’un des sommets universels du stoïcisme pratique et de la maîtrise absolue de l’esprit.',
    chapters: [
      {
        id: 'aurele_livre_2',
        title: 'Livre II : Au lever du soleil',
        subtitle: 'Se préparer aux tumultes du monde',
        content: [
          'Dès l’aurore, dis-toi par avance : « Je vais rencontrer un indiscret, un ingrat, un insolent, un fourbe, un envieux, un égoïste. »',
          'Tous ces défauts sont chez eux les suites de leur ignorance des vrais biens et des vrais maux.',
          'Pour moi, qui ai contemplé la nature du bien et reconnu qu’il est beau, la nature du mal et reconnu qu’il est honteux, et la nature même du coupable et reconnu qu’il est mon parent, non par le sang ou la semence, mais par la communauté de l’intelligence et d’une parcelle de la divinité ;',
          'Je ne puis subir aucun dommage de la part d’aucun d’eux, car personne ne peut me couvrir d’opprobre. Je ne puis pas davantage m’irriter contre un parent, ni le prendre en haine.',
          'Nous sommes nés pour collaborer, comme les pieds, les mains, les paupières, les deux rangées de dents, celle d’en haut et celle d’en bas. Agir en ennemi les uns des autres est donc contre nature ; or, s’indigner et se détourner, c’est agir en ennemi.',
          'Ce que je suis, somme toute, c’est un peu de chair, un souffle de vie, et le principe directeur qui gouverne tout. Méprise la chair : ce n’est que sang, osselets, un tissu de nerfs, de veines et d’artères. Considère ce souffle : du vent, et jamais le même, à tout instant rejeté et de nouveau aspiré. Reste la troisième part : l’esprit souverain.',
        ],
      },
      {
        id: 'aurele_livre_4',
        title: 'Livre IV : La Citadelle Intérieure',
        subtitle: 'L’obstacle devient le chemin',
        content: [
          'Les hommes se cherchent des retraites à la campagne, sur les plages, dans les montagnes ; toi-même tu as coutume d’en éprouver le vif désir. Mais tout cela est de la plus vulgaire ignorance, puisqu’il t’est permis, à toute heure que tu voudras, de te retirer en toi-même.',
          'Nulle part, en effet, l’homme ne trouve de retraite plus tranquille et plus exempte de soucis que dans son âme, surtout celui qui porte au dedans de lui-même de telles pensées qu’en s’y penchant, il jouit aussitôt d’une paix parfaite.',
          'Accorde-toi donc sans cesse cette retraite, et renouvelle-toi. Que tes maximes soient brèves et fondamentales, telles qu’aussitôt présentes à l’esprit, elles suffisent à dissiper toute affliction et à te renvoyer sans dépit aux devoirs auxquels tu dois faire face.',
          'Rappelle-toi cette maxime suprême : l’esprit s’adapte et convertit tout obstacle dressé devant lui en matière pour sa propre action. L’obstacle à l’action favorise l’action. Ce qui se dresse sur le chemin devient le chemin.',
          'Ne te laisse pas ballotter par le souffle de l’opinion. Dans chaque impulsion, agis selon la justice ; dans chaque pensée, préserve la faculté de comprendre.',
        ],
      },
      {
        id: 'aurele_livre_8',
        title: 'Livre VIII : Rigueur & Constance',
        subtitle: 'Le devoir d’un homme sous l’épreuve',
        content: [
          'Le matin, quand tu as de la peine à te lever, aie cette pensée présente à l’esprit : « Je m’éveille pour faire un travail d’homme. »',
          'Vais-je donc encore être de mauvaise humeur, si je pars faire ce pour quoi je suis né et ce en vue de quoi j’ai été introduit dans le monde ? Ai-je donc été formé pour rester couché au chaud sous mes couvertures ?',
          '« Mais cela fait plus de plaisir ! » Es-tu donc né pour le plaisir, et non pour l’effort et l’action ? Ne vois-tu pas les plantes, les petits oiseaux, les fourmis, les araignées, les abeilles remplir leur tâche propre et contribuer pour leur part à l’ordre du monde ?',
          'Et toi, refuserais-tu d’accomplir ton devoir d’homme ? Ne te hâteras-tu pas vers ce qui est conforme à ta nature ?',
        ],
      },
    ],
  },
  b_seneque_temps: {
    bookId: 'b_seneque_temps',
    title: 'De la Brièveté de la vie',
    author: 'Sénèque',
    summary:
      'L’un des plus grands manifestes sur l’allocation impitoyable de notre ressource la plus précieuse : le temps. Indispensable pour tout athlète qui s’égare dans les distractions frivoles.',
    chapters: [
      {
        id: 'seneque_chap_1',
        title: 'Chapitre I : L’illusion du manque de temps',
        subtitle: 'Nous ne recevons pas une vie brève, nous la rendons telle',
        content: [
          'La plupart des mortels, Paulinus, se plaignent de l’injustice de la nature, de ce que nous soyons nés pour un temps si court, de ce que l’espace qui nous est accordé s’écoule si vite et avec tant de rapidité.',
          'Ce n’est point que nous ayons peu de temps, c’est que nous en perdons beaucoup.',
          'La vie est assez longue, et elle nous a été donnée avec assez de générosité pour l’accomplissement des plus grandes choses, si elle était tout entière bien employée.',
          'Mais quand elle s’écoule dans les délices et la négligence, sans être consacrée à rien de bon, quand enfin la dernière nécessité nous presse, cette vie que nous n’avions pas vue marcher, nous sentons qu’elle est passée.',
          'Il en est ainsi : nous ne recevons pas une vie brève, mais nous la rendons telle ; nous ne sommes pas pauvres en temps, mais prodigues.',
        ],
      },
      {
        id: 'seneque_chap_3',
        title: 'Chapitre III : La possession de soi',
        subtitle: 'Personne ne laisse envahir son domaine, mais chacun laisse piller son temps',
        content: [
          'Personne ne consent à partager son argent ; mais parmi combien de gens chacun ne distribue-t-il pas sa vie !',
          'On est avare quand il s’agit de défendre son patrimoine ; dès qu’il s’agit de perdre son temps, on est prodigue de la seule chose dont l’avarice serait honorable.',
          'Prends un vieillard parmi les plus âgés : « Vois, tu approches du terme extrême de l’existence humaine ; tu as cent ans ou plus. Fais le compte de tes années. Calcule combien de temps t’ont dérobé tes créanciers, tes maîtresses, tes patrons, les querelles domestiques, les courses inutiles dans la ville. »',
          'Tu verras que tu as bien moins d’années que tu n’en comptes. Repasse dans ta mémoire quand tu as été ferme dans un dessein, combien de journées ont suivi le cours que tu leur avais tracé, quand tu as disposé de toi-même.',
        ],
      },
    ],
  },
  b_seneque_ame: {
    bookId: 'b_seneque_ame',
    title: 'De la Tranquillité de l’âme',
    author: 'Sénèque',
    summary:
      'Traité stoïcien analysant l’agitation perpétuelle, l’inconstance, la nausée du quotidien et les remèdes souverains pour acquérir la solidité d’un roc.',
    chapters: [
      {
        id: 'tranquillite_1',
        title: 'Chapitre I : L’état de sérénité (Euthymia)',
        subtitle: 'Avoir confiance en soi et marcher sur sa propre voie',
        content: [
          'Ce que tu demandes est grand, élevé, voisin de la divinité : c’est de n’être point ébranlé.',
          'Les Grecs appellent cette ferme assiette de l’âme euthymia, terme auquel Démocrite a consacré un ouvrage admirable. Pour moi, je l’appelle tranquillité.',
          'Ce qu’il nous faut chercher, c’est comment l’esprit peut marcher d’un pas toujours égal et favorable, en paix avec lui-même, contemplant avec joie ce qui lui appartient.',
          'Aucun vent n’est favorable à celui qui ne sait pas vers quel port il navigue.',
          'Il faut savoir supporter les difficultés avec calme, car l’âme forte tire parti de tout événement, transformant chaque obstacle en forge de vertu.',
        ],
      },
    ],
  },
  b_art_of_war: {
    bookId: 'b_art_of_war',
    title: 'L’Art de la Guerre',
    author: 'Sun Tzu',
    summary:
      'Le traité militaire classique le plus influent de l’histoire humaine. Une leçon magistrale de stratégie, de maîtrise de l’information et d’économie des forces pour remporter chaque duel.',
    chapters: [
      {
        id: 'suntzu_1',
        title: 'Chapitre I : De l’Évaluation stratégique',
        subtitle: 'Les cinq facteurs fondamentaux',
        content: [
          'La guerre est une affaire d’une importance vitale pour l’État. C’est le terrain de la vie et de la mort, la voie de la survie ou de la ruine. Il est impératif de l’étudier en profondeur.',
          'Gouvernez vos calculs selon cinq constantes : la doctrine morale, le ciel (le climat et le timing), la terre (les distances et le terrain), le commandement (la sagesse et la rigueur), et la discipline.',
          'Toute guerre repose sur l’art de la tromperie. C’est pourquoi, lorsque nous sommes capables d’attaquer, nous devons feindre l’incapacité ; lorsque nous manœuvrons nos forces, nous devons paraître inactifs ; lorsque nous sommes proches, nous devons faire croire que nous sommes loin.',
        ],
      },
      {
        id: 'suntzu_3',
        title: 'Chapitre III : L’Attaque stratégique',
        subtitle: 'Vaincre sans combattre',
        content: [
          'L’art suprême de la guerre consiste à soumettre l’ennemi sans avoir à livrer bataille.',
          'Remporter cent victoires dans cent batailles n’est pas le comble de l’habileté. Le comble de l’habileté consiste à briser la résistance de l’ennemi sans combattre.',
          'Connais ton ennemi et connais-toi toi-même ; en cent combats, tu ne seras jamais en danger.',
          'Si tu ignores ton ennemi mais que tu te connais toi-même, tes chances de victoire et de défaite seront égales.',
          'Si tu ignores à la fois ton ennemi et toi-même, tu es certain de succomber dans chaque affrontement.',
        ],
      },
    ],
  },
  b_machiavel: {
    bookId: 'b_machiavel',
    title: 'Le Prince',
    author: 'Nicolas Machiavel',
    summary:
      'Analyse lucide et tranchante du pouvoir, de l’autorité et de l’action efficace. Manuel indispensable pour comprendre les dynamiques de groupe et le leadership des clans.',
    chapters: [
      {
        id: 'machiavel_15',
        title: 'Chapitre XV : Des choses pour lesquelles les hommes sont loués ou blâmés',
        subtitle: 'La vérité effective des choses',
        content: [
          'Il me reste maintenant à voir comment un prince doit se comporter avec ses sujets et ses amis.',
          'Et comme je sais que beaucoup ont écrit sur ce sujet, je crains d’être jugé présomptueux d’en écrire encore, d’autant plus que je m’écarterai des règles prescrites par les autres.',
          'Mais mon intention étant d’écrire des choses utiles à ceux qui les comprennent, il m’a semblé plus profitable de suivre la vérité effective de la chose que l’imagination qu’on en fait.',
          'Beaucoup se sont imaginé des républiques et des principautés que l’on n’a jamais vues ni connues exister réellement ; car il y a si loin de la façon dont on vit à celle dont on devrait vivre, que celui qui laisse ce qui se fait pour ce qui se devrait faire apprend plutôt à se perdre qu’à se préserver.',
        ],
      },
      {
        id: 'machiavel_17',
        title: 'Chapitre XVII : De la cruauté et de la clémence',
        subtitle: 'Vaut-il mieux être aimé que craint ?',
        content: [
          'Il naît de ceci une dispute : s’il vaut mieux être aimé que craint, ou le contraire.',
          'On répond que l’on voudrait être l’un et l’autre ; mais comme il est difficile de les assembler, il est beaucoup plus sûr d’être craint que d’être aimé, lorsque l’on doit se priver de l’un des deux.',
          'Car des hommes, on peut dire généralement ceci : qu’ils sont ingrats, changeants, simulateurs et dissimulateurs, fuyards devant les périls, avides de gain.',
          'Tant que vous leur faites du bien, ils sont tout à vous, ils vous offrent leur sang, leurs biens, leur vie et leurs enfants, comme j’ai dit plus haut, quand le besoin est éloigné ; mais quand il s’approche, ils se révoltent.',
        ],
      },
    ],
  },
  b_musashi: {
    bookId: 'b_musashi',
    title: 'Le Traité des Cinq Roues (Gorin no Sho)',
    author: 'Miyamoto Musashi',
    summary:
      'Rédigé dans la grotte de Reigandō avant sa mort par le légendaire samouraï aux 61 duels invaincus. Principes d’escrime, de perception et de focalisation totale.',
    chapters: [
      {
        id: 'musashi_terre',
        title: 'Le Rouleau de la Terre',
        subtitle: 'Poser les fondations inébranlables',
        content: [
          'La Voie de la stratégie consiste à comprendre les vertus de son art et à savoir comment l’appliquer en toutes circonstances.',
          'Dans la Voie des guerriers, il n’est question que d’une chose : vaincre.',
          'Ne concevez aucune inclination particulière pour une arme ou une technique. S’attacher excessivement à une méthode est aussi néfaste que de l’ignorer.',
          'Les règles fondamentales pour apprendre ma Voie de la stratégie sont : 1. Ne pas avoir de pensées perverses. 2. Pratiquer sans relâche. 3. S’intéresser à tous les arts. 4. Connaître les voies de toutes les professions. 5. Discerner les avantages et les inconvénients de chaque chose.',
          '6. Développer le jugement intuitif. 7. Percevoir ce qui n’est pas visible. 8. Faire attention même aux moindres détails. 9. Ne rien faire qui ne soit d’aucune utilité.',
        ],
      },
      {
        id: 'musashi_eau',
        title: 'Le Rouleau de l’Eau',
        subtitle: 'Prendre la forme de son récipient',
        content: [
          'Prenez l’eau pour modèle. L’eau s’adapte à la forme du récipient, qu’il soit rond ou carré ; elle n’est qu’une goutte, ou elle est l’océan.',
          'Que votre esprit soit clair et sans contrainte, ni trop tendu, ni trop relâché. Évitez qu’il ne s’arrête sur une seule chose.',
          'Dans le combat, votre regard doit être large et ouvert. Sachez distinguer la vision d’ensemble (Kan) de la vue détaillée (Ken). Kan est puissant, Ken est faible.',
          'Voir ce qui est loin comme si c’était proche, et voir ce qui est proche comme si c’était loin : voilà le secret de la perception.',
        ],
      },
    ],
  },
  b_epictete: {
    bookId: 'b_epictete',
    title: 'Manuel d’Épictète (Enchiridion)',
    author: 'Épictète',
    summary:
      'Ancien esclave romain affranchi devenu le phare du stoïcisme pratique. Guide condensé pour distinguer ce qui dépend de nous de ce qui n’en dépend pas.',
    chapters: [
      {
        id: 'epictete_1',
        title: 'Chapitre I : La Dichotomie du Contrôle',
        subtitle: 'Le fondement de toute liberté',
        content: [
          'Parmi les choses, les unes dépendent de nous, les autres ne dépendent pas de nous.',
          'Dépendent de nous : notre jugement, nos impulsions, nos désirs, nos aversions, en un mot tout ce qui est notre œuvre propre.',
          'Ne dépendent pas de nous : notre corps, notre réputation, notre fortune, les charges publiques, en un mot tout ce qui n’est pas notre œuvre propre.',
          'Les choses qui dépendent de nous sont libres par nature, rien ne peut les arrêter ni les entraver. Celles qui ne dépendent pas de nous sont impuissantes, asservies, sujettes à empêchement, étrangères.',
          'Rappelle-toi donc que si tu prends pour libres les choses qui sont de leur nature esclaves, et pour tiennes celles qui sont étrangères, tu seras entravé, tu gémiras, tu seras troublé, tu t’en prendras aux dieux et aux hommes.',
          'Mais si tu ne crois tien que ce qui est à toi, et étranger ce qui t’est étranger, nul ne te contraindra jamais, nul ne t’arrêtera, tu ne te plaindras de personne, tu ne feras rien contre ton gré, nul ne te nuira, tu n’auras point d’ennemi.',
        ],
      },
      {
        id: 'epictete_5',
        title: 'Chapitre V : L’Origine de la Souffrance',
        subtitle: 'Ce ne sont pas les choses qui nous troublent',
        content: [
          'Ce qui trouble les hommes, ce ne sont point les choses, mais les opinions qu’ils ont des choses.',
          'Ainsi, la mort n’a rien de redoutable ; sinon elle eût paru telle à Socrate. Mais c’est l’opinion que la mort est redoutable qui est redoutable.',
          'Lors donc que nous sommes entravés, troublés ou affligés, ne nous en prenons jamais à d’autres qu’à nous-mêmes, c’est-à-dire à nos propres jugements.',
          'Accuser les autres de ses propres malheurs est le fait d’un ignorant ; n’en accuser que soi-même est le fait d’un homme qui commence à s’instruire ; n’en accuser ni autrui ni soi-même est le fait d’un homme pleinement instruit.',
        ],
      },
    ],
  },
  b_lao_tseu: {
    bookId: 'b_lao_tseu',
    title: 'Tao Te King (Le Livre de la Voie et de la Vertu)',
    author: 'Lao Tseu',
    summary:
      'Le texte sacré de la philosophie orientale. La maîtrise du Wu Wei (non-agir intentionnel), la fluidité et la puissance de la souplesse face à la rigidité.',
    chapters: [
      {
        id: 'lao_1',
        title: 'Chapitre I : L’Origine sans Nom',
        subtitle: 'La Voie éternelle',
        content: [
          'La Voie qui peut être exprimée par la parole n’est pas la Voie éternelle.',
          'Le Nom qui peut être nommé n’est pas le Nom éternel.',
          'Sans nom, elle est l’origine du ciel et de la terre. Avec un nom, elle est la mère de tous les êtres.',
          'C’est pourquoi, par le non-désir, on en contemple le mystère secret ; par le désir, on en contemple les manifestations bornées.',
        ],
      },
      {
        id: 'lao_8',
        title: 'Chapitre VIII : La Suprême Bonté de l’Eau',
        subtitle: 'La puissance sans rivale de l’abaissement',
        content: [
          'La bonté suprême ressemble à l’eau.',
          'L’eau est bonne en ce qu’elle profite à tous les êtres sans jamais lutter avec eux.',
          'Elle s’établit dans les lieux que tous les hommes méprisent ; c’est pourquoi elle est très proche de la Voie.',
          'Elle ne cherche pas à briller, c’est pourquoi rien ne saurait rivaliser avec elle.',
          'Ce qui est souple et fléchi survit ; ce qui est dur et rigide se brise.',
        ],
      },
    ],
  },
};

// PODCAST & AUDIO DETAILED TRANSCRIPTS
export interface AudioTranscriptEpisode {
  audioId: string;
  title: string;
  speaker: string;
  duration: string;
  category: string;
  ambientSound: string;
  audioSourceUrl?: string;
  sections: {
    timestamp: string;
    heading: string;
    speech: string;
  }[];
}

export const AUDIO_PODCASTS_TRANSCRIPTS: Record<string, AudioTranscriptEpisode> = {
  audio_01: {
    audioId: 'audio_01',
    title: 'Transformer sa Vie par la Callisthénie',
    speaker: 'Osirion Mentor • Grand Arbitre',
    duration: '12m 45s',
    category: 'FORGE',
    ambientSound: 'Méditation Stoïcienne & Tambours Martiaux',
    sections: [
      {
        timestamp: '00:00',
        heading: 'Introduction : Le Choc du Premier Contact',
        speech:
          'Bienvenue dans cette transmission de la Forge Osirion. Regardez cette barre au-dessus de vous. Elle ne ment jamais. Elle ne connaît ni votre statut social, ni vos excuses, ni vos doutes. Face au poids de votre propre corps, toutes les illusions tombent.',
      },
      {
        timestamp: '03:15',
        heading: 'La Douleur comme Instrument de Mesure',
        speech:
          'Lorsque vos avant-bras brûlent à la huitième traction et que votre souffle se bloque, votre esprit animal vous hurle de lâcher prise. C’est précisément à cet instant que le temple s’érige. Chaque demi-seconde de suspension supplémentaire forge une vertu que nul livre ne pourra jamais vous enseigner.',
      },
      {
        timestamp: '07:40',
        heading: 'L’Alchimie Mentale : Du Muscle à la Volonté',
        speech:
          'Celui qui apprend à dompter la gravité apprend à dompter le destin. Si vous êtes capable d’arracher une répétition pure quand votre corps refuse d’obéir, vous serez capable de rester inébranlable dans n’importe quelle épreuve de votre vie civile.',
      },
      {
        timestamp: '11:20',
        heading: 'Conclusion & Ordre du Jour',
        speech:
          'Ne quittez pas ce sanctuaire sans avoir gravé un nouvel engagement dans votre esprit. L’entraînement n’est pas un passe-temps : c’est votre serment d’honneur. Allez au bout.',
      },
    ],
  },
  audio_02: {
    audioId: 'audio_02',
    title: 'Protocole Anti-Procrastination Immédiat',
    speaker: 'Marcus V. • Voie du Guerrier',
    duration: '08m 12s',
    category: 'MINDSET',
    ambientSound: 'Fréquence Alpha 432Hz • Focus Ultime',
    sections: [
      {
        timestamp: '00:00',
        heading: 'La Règle des Cinq Secondes',
        speech:
          'Écoutez attentivement. Le cerveau humain est conçu pour vous protéger de l’inconfort. Entre l’intention d’aller vous entraîner et le premier pas vers la porte, il existe une fenêtre critique de cinq secondes. Au-delà, les rationalisations de la paresse prennent le contrôle.',
      },
      {
        timestamp: '02:50',
        heading: 'Détruire la Délibération',
        speech:
          'Ne négociez jamais avec vous-même le matin ou après une journée d’effort. Le guerrier ne se demande pas s’il a envie de s’entraîner. Il enfile ses chaussures et commence la première pompe avant même que son esprit critique n’ait pu émettre un murmure.',
      },
      {
        timestamp: '06:15',
        heading: 'L’Action Précède la Motivation',
        speech:
          'La motivation n’est pas le carburant qui lance la machine ; c’est le feu qui naît du frottement de l’action. Déclenchez le mouvement physique, et l’énergie suivra.',
      },
    ],
  },
  audio_saitama: {
    audioId: 'audio_saitama',
    title: 'Discours Saitama : La Rigueur Quotidienne',
    speaker: 'Voix du Bastion • Discipline Absolue',
    duration: '10m 30s',
    category: 'MOTIVATION',
    ambientSound: 'Battement Cardiaque & Cordes Épiques',
    sections: [
      {
        timestamp: '00:00',
        heading: 'Le Mythe de la Formule Magique',
        speech:
          'Tout le monde cherche un secret, un complément alimentaire secret, un raccourci technologique. Mais il n’y a aucun mystère. Cent pompes, cent tractions, cent squats, dix kilomètres de course. Chaque jour. Sans climatisation en été, sans chauffage en hiver.',
      },
      {
        timestamp: '04:10',
        heading: 'Briser le Limiteur Humain',
        speech:
          'Ce n’est pas l’intensité d’une journée qui crée le titan ; c’est la monotonie inflexible répétée pendant des mois sans jamais faiblir. Quand vous aurez fait cela mille fois, les obstacles qui terrifiaient les autres vous paraîtront dérisoires.',
      },
      {
        timestamp: '08:00',
        heading: 'Le Silence après la Tempête',
        speech:
          'Ressentez la puissance du devoir accompli. Votre séance n’est pas négociable. Relevez la tête et allez vous entraîner.',
      },
    ],
  },
};
