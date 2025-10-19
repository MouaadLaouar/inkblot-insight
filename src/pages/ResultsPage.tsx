import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface TestData {
  id: string;
  patient_id: string;
  test_date: string;
  status: string;
  patients: {
    first_name: string;
    last_name: string;
  };
}

interface RorschachStats {
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

const calculateRorschachStats = (responses: TestResponse[]): RorschachStats => {
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
  });
  
  // F% calculations - FIXED: Calculate based on total F responses
  const F_total = determinants.F + determinants.F_plus + determinants.F_minus + determinants.F_extended;
  const F_percentage = R > 0 ? parseFloat(((F_total / R) * 100).toFixed(2)) : 0;
  
  // F+%, F-%, F+-% are percentages OF the F responses, not of R
  const F_plus_percentage = F_total > 0 ? parseFloat(((determinants.F_plus / F_total) * 100).toFixed(2)) : 0;
  const F_minus_percentage = F_total > 0 ? parseFloat(((determinants.F_minus / F_total) * 100).toFixed(2)) : 0;
  const F_extended_percentage = F_total > 0 ? parseFloat(((determinants.F_extended / F_total) * 100).toFixed(2)) : 0;
  
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
  const F_compl = `=${totalK_compl}K/${totalE_compl}E`;
  
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

const ResultsPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<TestData | null>(null);
  const [responses, setResponses] = useState<TestResponse[]>([]);
  const [stats, setStats] = useState<RorschachStats | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!testId) return;
      
      try {
        const [testResult, responsesResult] = await Promise.all([
          supabase
            .from("rorschach_tests")
            .select("*, patients(first_name, last_name)")
            .eq("id", testId)
            .single(),
          supabase
            .from("test_responses")
            .select("*")
            .eq("test_id", testId)
            .order("card_number")
            .order("response_number"),
        ]);

        if (testResult.error) throw testResult.error;
        if (responsesResult.error) throw responsesResult.error;

        setTest(testResult.data);
        setResponses(responsesResult.data || []);
        
        const calculatedStats = calculateRorschachStats(responsesResult.data || []);
        setStats(calculatedStats);
        
        console.log("Calculated Stats:", calculatedStats); // Debug log
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [testId]);

  if (loading || !stats || !test) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-clinical-gray/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4 whitespace-normal">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                Rorschach Test Results - {test.patients.last_name}, {test.patients.first_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Test Date: {new Date(test.test_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          {/* <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="secondary">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div> */}
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Psychogram Header */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>المخطط النفسي (Psychogram)</CardTitle>
            <CardDescription>Complete Rorschach scoring summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-muted/30">
              {/* Left Column */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">R=</span>
                  <span>{stats.R}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">T.t=</span>
                  <span>{stats.totalTestTime}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">T/R=</span>
                  <span>{stats.totalLatency}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">T.lat.moy.=</span>
                  <span>{stats.avgLatency}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">T.R.I.=</span>
                  <span>{stats.TRI}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">F.compl.</span>
                  <span>{stats.F_compl}</span>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">G=</span>
                  <span>{stats.location.G.count} ,G%={stats.location.G.percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">D=</span>
                  <span>{stats.location.D.count} ,D%={stats.location.D.percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Dd=</span>
                  <span>{stats.location.Dd.count} ,Dd%={stats.location.Dd.percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Dbl=</span>
                  <span>{stats.location.Dbl.count} ,Dbl%={stats.location.Dbl.percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Ddbl=</span>
                  <span>{stats.location.Ddbl.count} ,Ddbl%={stats.location.Ddbl.percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Do=</span>
                  <span>{stats.location.Do.count} ,Do%={stats.location.Do.percentage}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">F=</span>
                  <span>{stats.F_total} ,F%={stats.F_percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">F+=</span>
                  <span>{stats.determinants.F_plus} ,F+%={stats.F_plus_percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">F+elarg.%=</span>
                  <span>{stats.F_extended_percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">F-=</span>
                  <span>{stats.determinants.F_minus} ,F-%={stats.F_minus_percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">F+-=</span>
                  <span>{stats.determinants.F_extended} ,F+-%={stats.F_extended_percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">FC=</span>
                  <span>{stats.determinants.FC}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">RC%=</span>
                  <span>{stats.RC_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Ban=</span>
                  <span>{stats.Ban_count} ,Ban%={stats.Ban_percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Angoisse=</span>
                  <span>{stats.Angoisse_formula}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">CF=</span>
                  <span>{stats.determinants.CF}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">C=</span>
                  <span>{stats.determinants.C}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">C'=</span>
                  <span>{stats.determinants.C_prime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Kan=</span>
                  <span>{stats.determinants.kan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">A=</span>
                  <span>{stats.content.A} ,A%={stats.A_percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">H=</span>
                  <span>{stats.content.H} ,H%={stats.H_percentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Anat=</span>
                  <span>{stats.content.Anat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Bot=</span>
                  <span>{stats.content.Bot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Géo=</span>
                  <span>{stats.content.Géo}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
            <CardDescription>
              Overview of test administration and response patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.R}</div>
                <div className="text-sm text-muted-foreground">Total Responses (R)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.F_percentage}%</div>
                <div className="text-sm text-muted-foreground">Form Percentage (F%)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.TRI}</div>
                <div className="text-sm text-muted-foreground">TRI</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.Ban_count}</div>
                <div className="text-sm text-muted-foreground">Popular (Ban)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="structural" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structural">Structural Summary</TabsTrigger>
            <TabsTrigger value="location">Location Analysis</TabsTrigger>
            <TabsTrigger value="determinants">Determinants</TabsTrigger>
            <TabsTrigger value="content">Content Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="structural" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Form Quality Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Good Form (F+)</span>
                      <Badge variant="outline">{stats.determinants.F_plus} ({stats.F_plus_percentage}%)</Badge>
                    </div>
                    <Progress value={stats.F_plus_percentage} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Poor Form (F-)</span>
                      <Badge variant="destructive">{stats.determinants.F_minus} ({stats.F_minus_percentage}%)</Badge>
                    </div>
                    <Progress value={stats.F_minus_percentage} className="bg-destructive/20" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Extended Form (F+-)</span>
                      <Badge variant="outline">{stats.determinants.F_extended} ({stats.F_extended_percentage}%)</Badge>
                    </div>
                    <Progress value={stats.F_extended_percentage} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Neutral Form (F)</span>
                      <Badge variant="outline">{stats.determinants.F}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Indices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-medium">F%</span>
                    <Badge>{stats.F_percentage}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-medium">RC%</span>
                    <Badge>{stats.RC_percentage}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-medium">TRI</span>
                    <Badge>{stats.TRI}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-medium">F.compl</span>
                    <Badge variant="outline">{stats.F_compl}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Ban</span>
                    <Badge>{stats.Ban_count} ({stats.Ban_percentage}%)</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Avg Latency</span>
                    <Badge>{stats.avgLatency}s</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                    <span className="text-sm font-medium">Angoisse</span>
                    <Badge variant={stats.Anat_percentage > 20 ? "destructive" : "secondary"}>
                      {stats.Angoisse_formula}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Features</CardTitle>
                <CardDescription>Distribution of response locations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.location).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{key}</span>
                      <span className="text-sm text-muted-foreground">
                        {value.count} responses ({value.percentage}%)
                      </span>
                    </div>
                    <Progress value={value.percentage} className="h-3" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="determinants" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Movement Responses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Human Movement (K)</span>
                    <Badge variant="secondary">{stats.determinants.K}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Partial Human (Kp)</span>
                    <Badge variant="secondary">{stats.determinants.Kp}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Animal Movement (kan)</span>
                    <Badge variant="secondary">{stats.determinants.kan}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Object Movement (kob)</span>
                    <Badge variant="secondary">{stats.determinants.kob}</Badge>
                  </div>
                  <div className="mt-4 p-2 bg-muted rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ΣK (K + Kp)</span>
                      <Badge>{stats.sumK}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Color Responses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Chromatic</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pure Color (C)</span>
                    <Badge variant="secondary">{stats.determinants.C}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Color-Form (CF)</span>
                    <Badge variant="secondary">{stats.determinants.CF}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Form-Color (FC)</span>
                    <Badge variant="secondary">{stats.determinants.FC}</Badge>
                  </div>
                  
                  <h4 className="text-xs font-semibold text-muted-foreground mt-4 mb-2">Achromatic</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">C'</span>
                    <Badge variant="secondary">{stats.determinants.C_prime}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">C'F</span>
                    <Badge variant="secondary">{stats.determinants.C_primeF}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">FC'</span>
                    <Badge variant="secondary">{stats.determinants.FC_prime}</Badge>
                  </div>

                  <div className="mt-4 p-2 bg-muted rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ΣC (weighted)</span>
                      <Badge>{stats.sumC}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shading (Estompage)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pure Shading (E)</span>
                    <Badge variant="secondary">{stats.determinants.E}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Shading-Form (EF)</span>
                    <Badge variant="secondary">{stats.determinants.EF}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Form-Shading (FE)</span>
                    <Badge variant="secondary">{stats.determinants.FE}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clair-Obscur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pure Clob</span>
                    <Badge variant="secondary">{stats.determinants.Clob}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ClobF</span>
                    <Badge variant="secondary">{stats.determinants.ClobF}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">FClob</span>
                    <Badge variant="secondary">{stats.determinants.FClob}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Human Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">H%</span>
                      <Badge>{stats.H_percentage}%</Badge>
                    </div>
                    <Progress value={stats.H_percentage} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>H:</span>
                      <span>{stats.content.H}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>(H):</span>
                      <span>{stats.content.H_parentheses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hd:</span>
                      <span>{stats.content.Hd}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>(Hd):</span>
                      <span>{stats.content.Hd_parentheses}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Animal Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">A%</span>
                      <Badge>{stats.A_percentage}%</Badge>
                    </div>
                    <Progress value={stats.A_percentage} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>A:</span>
                      <span>{stats.content.A}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>(A):</span>
                      <span>{stats.content.A_parentheses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ad:</span>
                      <span>{stats.content.Ad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>(Ad):</span>
                      <span>{stats.content.Ad_parentheses}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Other Content Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Anat:</span>
                      <Badge variant="outline">{stats.content.Anat}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Sex:</span>
                      <Badge variant="outline">{stats.content.Sex}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Bot:</span>
                      <Badge variant="outline">{stats.content.Bot}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Géo:</span>
                      <Badge variant="outline">{stats.content.Géo}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Nat:</span>
                      <Badge variant="outline">{stats.content.Nat}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Obj:</span>
                      <Badge variant="outline">{stats.content.Obj}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Arch:</span>
                      <Badge variant="outline">{stats.content.Arch}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Art:</span>
                      <Badge variant="outline">{stats.content.Art}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Abs:</span>
                      <Badge variant="outline">{stats.content.Abs}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anxiety Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Anatomy + Sexual Content</span>
                      <Badge variant={stats.Anat_percentage > 20 ? "destructive" : "secondary"}>
                        {stats.Anat_percentage}%
                      </Badge>
                    </div>
                    <Progress 
                      value={Math.min(stats.Anat_percentage, 100)} 
                      className={stats.Anat_percentage > 20 ? "bg-destructive/20" : ""}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Formula: {stats.Angoisse_formula}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.Anat_percentage > 20 
                        ? "Elevated anatomy content may suggest body concerns or anxiety"
                        : "Normal range for anatomy content"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ResultsPage;
