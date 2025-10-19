// Location codes based on Rorschach scoring system
export const LOCATION_OPTIONS = [
  { value: "G", label: "G - Globale", description: "Whole blot response (entire inkblot)" },
  { value: "D", label: "D - Détail", description: "Common detail area (frequently selected)" },
  { value: "Dd", label: "Dd - Détail rare", description: "Unusual/rare detail area (infrequently selected)" },
  { value: "Dbl", label: "Dbl - Détail blanc", description: "White space detail" },
  { value: "Ddbl", label: "Ddbl - Détail blanc rare", description: "Rare white space detail" },
  { value: "Do", label: "Do - Détail oligophrénique", description: "Oligophrenic detail (very small, inappropriate area)" },
];

// Determinants based on Rorschach scoring system
export const DETERMINANT_OPTIONS = [
  // Form determinants
  { value: "F+", label: "F+ - Forme bonne", description: "Good form quality" },
  { value: "F-", label: "F- - Forme mauvaise", description: "Poor form quality" },
  { value: "F+-", label: "F+- - Forme élargie", description: "Extended/approximate form" },
  { value: "F", label: "F - Forme", description: "Pure form (neutral quality)" },
  
  // Chromatic color determinants
  { value: "C", label: "C - Couleur pure", description: "Pure color (no form)" },
  { value: "CF", label: "CF - Couleur-Forme", description: "Color dominates form" },
  { value: "FC", label: "FC - Forme-Couleur", description: "Form dominates color" },
  
  // Achromatic color determinants
  { value: "C'", label: "C' - Couleur achromatique", description: "Pure achromatic (black, white, gray)" },
  { value: "C'F", label: "C'F - Couleur achromatique-Forme", description: "Achromatic color dominates form" },
  { value: "FC'", label: "FC' - Forme-Couleur achromatique", description: "Form dominates achromatic color" },
  
  // Shading determinants (estompage)
  { value: "E", label: "E - Estompage", description: "Pure shading/diffusion" },
  { value: "EF", label: "EF - Estompage-Forme", description: "Shading dominates form" },
  { value: "FE", label: "FE - Forme-Estompage", description: "Form dominates shading" },
  
  // Movement determinants (kinesthésies)
  { value: "K", label: "K - Kinesthésie humaine", description: "Human movement (major)" },
  { value: "Kp", label: "Kp - Kinesthésie partielle", description: "Partial human movement" },
  { value: "kan", label: "kan - Kinesthésie animale", description: "Animal movement" },
  { value: "kob", label: "kob - Kinesthésie objet", description: "Inanimate/object movement" },
  
  // Clair-obscur (chiaroscuro/darkness)
  { value: "Clob", label: "Clob - Clair-obscur pur", description: "Pure dark/threatening impression" },
  { value: "ClobF", label: "ClobF - Clair-obscur-Forme", description: "Dark impression dominates form" },
  { value: "FClob", label: "FClob - Forme-Clair-obscur", description: "Form dominates dark impression" },
];

// Content categories based on Rorschach scoring system
export const CONTENT_OPTIONS = [
  // Human content
  { value: "H", label: "H - Humain", description: "Whole human figure (real)" },
  { value: "(H)", label: "(H) - (Humain)", description: "Fictional/mythological human figure" },
  { value: "Hd", label: "Hd - Détail humain", description: "Human detail/body part" },
  { value: "(Hd)", label: "(Hd) - (Détail humain)", description: "Fictional human detail" },
  
  // Animal content
  { value: "A", label: "A - Animal", description: "Whole animal figure (real)" },
  { value: "(A)", label: "(A) - (Animal)", description: "Fictional/mythological animal" },
  { value: "Ad", label: "Ad - Détail animal", description: "Animal detail/body part" },
  { value: "(Ad)", label: "(Ad) - (Détail animal)", description: "Fictional animal detail" },
  
  // Anatomy and sexuality
  { value: "Anat", label: "Anat - Anatomie", description: "Anatomy (organs, bones, X-rays)" },
  { value: "Sex", label: "Sex - Sexuel", description: "Sexual organs or content" },
  
  // Nature and geography
  { value: "Nat", label: "Nat - Nature", description: "Natural phenomena (sky, water)" },
  { value: "Géo", label: "Géo - Géographie", description: "Geographic features (maps, islands)" },
  { value: "Bot", label: "Bot - Botanique", description: "Plants, flowers, trees" },
  
  // Objects and constructions
  { value: "Obj", label: "Obj - Objet", description: "Objects, tools, everyday items" },
  { value: "Arch", label: "Arch - Architecture", description: "Buildings, architectural elements" },
  { value: "Art", label: "Art - Art", description: "Art objects, paintings, sculptures" },
  
  // Abstract
  { value: "Abs", label: "Abs - Abstrait", description: "Abstract concepts, symbols" },
];
