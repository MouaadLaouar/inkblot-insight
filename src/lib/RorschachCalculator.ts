interface TestResponse {
  id: string;
  test_id: string;
  card_number: number;
  response_number: number;
  response_text: string;
  location: string;
  determinants: string;
  content_categories: string;
  ban: boolean;
  obs: string | null;
  intense_time: string | null;
  response_time: string | null;
}

export interface RorschachStats {
  R: number;
  totalTestTime: number;
  totalLatency: number;
  avgLatency: number;

  location: {
    G: { count: number; percentage: number };
    D: { count: number; percentage: number };
    Dd: { count: number; percentage: number };
    Dbl: { count: number; percentage: number };
    Ddbl: { count: number; percentage: number };
    Do: { count: number; percentage: number };
  };

  F_total: number;
  F_percentage: number;
  F_plus_percentage: number;
  F_minus_percentage: number;
  F_extended_percentage: number;
  F_pur: number;
  F_elargi: number;
  F_plus_pur: number;

  determinants: {
    F: number;
    F_plus: number;
    F_minus: number;
    F_extended: number;

    C: number;
    CF: number;
    FC: number;

    C_prime: number;
    C_primeF: number;
    FC_prime: number;

    E: number;
    EF: number;
    FE: number;

    K: number;
    Kp: number;
    kan: number;
    KF: number;
    FK: number;
    kob: number;

    Clob: number;
    ClobF: number;
    FClob: number;
  };

  sumK: number;
  sumC: number;
  TRI: string;
  F_compl: string;

  RC_percentage: number;

  content: {
    H: number;
    H_parentheses: number;
    Hd: number;
    Hd_parentheses: number;
    A: number;
    A_parentheses: number;
    Ad: number;
    Ad_parentheses: number;
    Anat: number;
    Sex: number;
    Bot: number;
    Géo: number;
    Nat: number;
    Obj: number;
    Arch: number;
    Art: number;
    Abs: number;
  };

  H_percentage: number;
  A_percentage: number;
  Anat_percentage: number;
  Angoisse_formula: string;

  Ban_count: number;
  Ban_percentage: number;
}

export const calculateRorschachStats = (responses: TestResponse[]): RorschachStats => {
  const R = responses.length;

  // Time calculations - parse as integers safely
  const responseTimes = responses
    .map(r => {
      if (!r.response_time) return 0;
      const parsed = parseInt(r.response_time);
      return isNaN(parsed) ? 0 : parsed;
    })
    .filter(t => t > 0);
  const totalTestTime = responseTimes.reduce((sum, t) => sum + t, 0);

  const latencies = responses
    .map(r => {
      if (!r.intense_time) return 0;
      const parsed = parseInt(r.intense_time);
      return isNaN(parsed) ? 0 : parsed;
    })
    .filter(t => t > 0);
  const totalLatency = latencies.reduce((sum, t) => sum + t, 0);
  const avgLatency = latencies.length > 0
    ? parseFloat((totalLatency / latencies.length).toFixed(2))
    : 0;

  // Location counts
  const locationCounts = {
    G: 0, D: 0, Dd: 0, Dbl: 0, Ddbl: 0, Do: 0
  };

  responses.forEach(r => {
    if (r.location && Object.prototype.hasOwnProperty.call(locationCounts, r.location)) {
      locationCounts[r.location as keyof typeof locationCounts]++;
    }
  });

  const location = {
    G: {
      count: locationCounts.G,
      percentage: R > 0 ? parseFloat(((locationCounts.G / R) * 100).toFixed(2)) : 0
    },
    D: {
      count: locationCounts.D,
      percentage: R > 0 ? parseFloat(((locationCounts.D / R) * 100).toFixed(2)) : 0
    },
    Dd: {
      count: locationCounts.Dd,
      percentage: R > 0 ? parseFloat(((locationCounts.Dd / R) * 100).toFixed(2)) : 0
    },
    Dbl: {
      count: locationCounts.Dbl,
      percentage: R > 0 ? parseFloat(((locationCounts.Dbl / R) * 100).toFixed(2)) : 0
    },
    Ddbl: {
      count: locationCounts.Ddbl,
      percentage: R > 0 ? parseFloat(((locationCounts.Ddbl / R) * 100).toFixed(2)) : 0
    },
    Do: {
      count: locationCounts.Do,
      percentage: R > 0 ? parseFloat(((locationCounts.Do / R) * 100).toFixed(2)) : 0
    },
  };

  // Determinants count
  const determinants = {
    F: 0, F_plus: 0, F_minus: 0, F_extended: 0,
    C: 0, CF: 0, FC: 0,
    C_prime: 0, C_primeF: 0, FC_prime: 0,
    E: 0, EF: 0, FE: 0,
    K: 0, Kp: 0, kan: 0, kob: 0,
    KF: 0, FK: 0,
    Clob: 0, ClobF: 0, FClob: 0,
  };

  responses.forEach(r => {
    const det = r.determinants?.trim();
    if (!det) return;

    if (det === 'F') determinants.F++;
    else if (det === 'F+') determinants.F_plus++;
    else if (det === 'F-') determinants.F_minus++;
    else if (det === 'F+-') determinants.F_extended++;
    else if (det === 'C') determinants.C++;
    else if (det === 'CF') determinants.CF++;
    else if (det === 'FC') determinants.FC++;
    else if (det === "C'") determinants.C_prime++;
    else if (det === "C'F") determinants.C_primeF++;
    else if (det === "FC'") determinants.FC_prime++;
    else if (det === 'E') determinants.E++;
    else if (det === 'EF') determinants.EF++;
    else if (det === 'FE') determinants.FE++;
    else if (det === 'K') determinants.K++;
    else if (det === 'Kp') determinants.Kp++;
    else if (det === 'kan') determinants.kan++;
    else if (det === 'kob') determinants.kob++;
    else if (det === 'Clob') determinants.Clob++;
    else if (det === 'ClobF') determinants.ClobF++;
    else if (det === 'FClob') determinants.FClob++;
    else if (det === 'KF') determinants.KF++;
    else if (det === 'FK') determinants.FK++;
  });

  // F% calculations - FIXED: Calculate based on total F responses
  const F_total = determinants.F + determinants.F_plus + determinants.F_minus + determinants.F_extended;
  const F_percentage = R > 0 ? parseFloat(((F_total / R) * 100).toFixed(2)) : 0;

  // F+%, F-%, F+-% are percentages OF the F responses, not of R
  const F_plus_percentage = F_total > 0 ? parseFloat(((determinants.F_plus / F_total) * 100).toFixed(2)) : 0;
  const F_minus_percentage = F_total > 0 ? parseFloat(((determinants.F_minus / F_total) * 100).toFixed(2)) : 0;
  const F_extended_percentage = F_total > 0 ? parseFloat(((determinants.F_extended / F_total) * 100).toFixed(2)) : 0;

  //   F_pur: number;
  //   F_elargi: number;
  //   F_plus_elargi: number;

  const F_pur = parseFloat(((F_total * 100) / R).toFixed(2));
  const F_elargi = parseFloat((((F_total + determinants.K + determinants.kan + determinants.FC + determinants.FE + determinants.FClob) * 100) / R).toFixed(2));
  const F_plus_pur = parseFloat((((determinants.F_plus + (determinants.F_extended / 2)) * 100) / F_total).toFixed(2));

  // TRI calculation - FIXED: Use proper weighting
  const sumK = determinants.K + determinants.Kp;
  const sumC = parseFloat((
    (determinants.C * 1.5) +
    (determinants.CF * 1) +
    (determinants.FC * 0.5) +
    (determinants.C_prime * 1.5) +
    (determinants.C_primeF * 1) +
    (determinants.FC_prime * 0.5)
  ).toFixed(1));

  const TRI = `${sumK}K/${sumC}C`;

  // F.compl calculation
  const totalK_compl = determinants.K + determinants.Kp;
  const totalE_compl = determinants.E + determinants.EF + determinants.FE;
  // const F_compl = `=${totalK_compl}K/${totalE_compl}E`;
  const F_compl = `${parseFloat((determinants.kan + determinants.kob + determinants.Kp).toFixed(1))}K/${parseFloat((
    (determinants.FE * 0.5) +
    (determinants.EF * 1) +
    (determinants.E * 1.5)
  ).toFixed(1))}E`;

  // RC% - FIXED: (D + Dd) / R
  const RC_percentage = R > 0
    ? parseFloat((((locationCounts.D + locationCounts.Dd) / R) * 100).toFixed(2))
    : 0;

  // Content analysis
  const content = {
    H: 0, H_parentheses: 0, Hd: 0, Hd_parentheses: 0,
    A: 0, A_parentheses: 0, Ad: 0, Ad_parentheses: 0,
    Anat: 0, Sex: 0, Bot: 0, Géo: 0, Nat: 0,
    Obj: 0, Arch: 0, Art: 0, Abs: 0,
  };

  responses.forEach(r => {
    const cont = r.content_categories?.trim();
    if (!cont) return;

    if (cont === 'H') content.H++;
    else if (cont === '(H)') content.H_parentheses++;
    else if (cont === 'Hd') content.Hd++;
    else if (cont === '(Hd)') content.Hd_parentheses++;
    else if (cont === 'A') content.A++;
    else if (cont === '(A)') content.A_parentheses++;
    else if (cont === 'Ad') content.Ad++;
    else if (cont === '(Ad)') content.Ad_parentheses++;
    else if (cont === 'Anat') content.Anat++;
    else if (cont === 'Sex') content.Sex++;
    else if (cont === 'Bot') content.Bot++;
    else if (cont === 'Géo') content.Géo++;
    else if (cont === 'Nat') content.Nat++;
    else if (cont === 'Obj') content.Obj++;
    else if (cont === 'Arch') content.Arch++;
    else if (cont === 'Art') content.Art++;
    else if (cont === 'Abs') content.Abs++;
  });

  // H% = (H + (H) + Hd + (Hd)) / R * 100
  const totalH = content.H + content.H_parentheses + content.Hd + content.Hd_parentheses;
  const H_percentage = R > 0 ? parseFloat(((totalH / R) * 100).toFixed(2)) : 0;

  // A% = (A + (A) + Ad + (Ad)) / R * 100
  const totalA = content.A + content.A_parentheses + content.Ad + content.Ad_parentheses;
  const A_percentage = R > 0 ? parseFloat(((totalA / R) * 100).toFixed(2)) : 0;

  // Angoisse = (Anat + Sex) / R * 100
  const anatSexTotal = content.Anat + content.Sex;
  const Anat_percentage = R > 0 ? parseFloat(((anatSexTotal / R) * 100).toFixed(2)) : 0;
  const Angoisse_formula = `${anatSexTotal}.100/${R}=${Anat_percentage}%`;

  // Ban
  const Ban_count = responses.filter(r => r.ban === true).length;
  const Ban_percentage = R > 0 ? parseFloat(((Ban_count / R) * 100).toFixed(2)) : 0;

  return {
    R,
    totalTestTime,
    totalLatency,
    avgLatency,
    location,
    F_total,
    F_percentage,
    F_plus_percentage,
    F_minus_percentage,
    F_extended_percentage,
    F_pur,
    F_elargi,
    F_plus_pur,
    determinants,
    sumK,
    sumC,
    TRI,
    F_compl,
    RC_percentage,
    content,
    H_percentage,
    A_percentage,
    Anat_percentage,
    Angoisse_formula,
    Ban_count,
    Ban_percentage,
  };
};