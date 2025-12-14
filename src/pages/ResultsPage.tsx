import { useEffect, useMemo, useState } from "react";
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
import { formatSToMS } from "@/lib/utils";
import {
  calculateRorschachStats,
  RorschachStats,
} from "@/lib/RorschachCalculator";
import { ColumnDef, getCoreRowModel } from "@tanstack/table-core";
import { flexRender, useReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PercentageWithLines from "@/components/PercentageWithLines";
import TRI_Note from "@/components/TRINote";
import TRINote from "@/components/TRINote";

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

const ResultsPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<TestData | null>(null);
  const [responses, setResponses] = useState<TestResponse[]>([]);
  const [stats, setStats] = useState<RorschachStats | null>(null);

  const columns = useMemo<ColumnDef<TestResponse>[]>(
    () => [
      {
        accessorKey: "response_N",
        header: "N #",
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
      },
      {
        accessorKey: "card_number",
        header: "Card Number",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.card_number}</div>
        ),
      },
      {
        accessorKey: "response_text",
        header: "Response Text (Observation)",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.response_text}</div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: responses.filter((item) => {
      return item.response_text;
    }),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

        // console.log(responsesResult.data);

        const calculatedStats = calculateRorschachStats(
          responsesResult.data || []
        );
        setStats(calculatedStats);

        // console.log("Calculated Stats:", calculatedStats); // Debug log
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
            <Button variant="ghost" size="icon" onClick={() => history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                Rorschach Test Results - {test.patients.last_name},{" "}
                {test.patients.first_name}
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
            <CardDescription>
              Complete Rorschach scoring summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-muted/30">
              {/* Left Column */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-start">
                  <span className="font-semibold">R=</span>
                  <span className="font-semibold">{stats.R}</span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="font-semibold">T.t=</span>
                  <span className="font-semibold">
                    {formatSToMS(stats.totalLatency)}
                  </span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="font-semibold">T/R=</span>
                  <span className="font-semibold">
                    {formatSToMS(stats.totalTestTime)}
                  </span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="font-semibold">T.lat.moy.=</span>
                  <span className="font-semibold">
                    {formatSToMS(stats.avgLatency)}
                  </span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="font-semibold">T.R.I.=</span>
                  <span className="font-semibold">{stats.TRI}</span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="font-semibold">F.compl.</span>
                  <span className="font-semibold">{stats.F_compl}</span>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">
                    G= {stats.location.G.count}
                  </span>
                  {/* <span className="font-semibold">
                    ,G%={stats.location.G.percentage}
                  </span> */}
                  <PercentageWithLines
                    label="G"
                    percentage={stats.location.G.percentage}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    D= {stats.location.D.count}{" "}
                  </span>
                  {/* <span className="font-semibold">
                    ,D%={stats.location.D.percentage}
                  </span> */}
                  <PercentageWithLines
                    label="D"
                    percentage={stats.location.D.percentage}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Dd= {stats.location.Dd.count}{" "}
                  </span>
                  {/* <span className="font-semibold">
                    ,Dd%={stats.location.Dd.percentage}
                  </span> */}
                  <PercentageWithLines
                    label="Dd"
                    percentage={stats.location.Dd.percentage}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Dbl= {stats.location.Dbl.count}{" "}
                  </span>
                  {/* <span className="font-semibold">
                    ,Dbl%={stats.location.Dbl.percentage}
                  </span> */}
                  <PercentageWithLines
                    label="Dbl"
                    percentage={stats.location.Dbl.percentage}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Ddbl= {stats.location.Ddbl.count}{" "}
                  </span>
                  <span className="font-semibold">
                    ,Ddbl%={stats.location.Ddbl.percentage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Do= {stats.location.Do.count}{" "}
                  </span>
                  <span className="font-semibold">
                    ,Do%={stats.location.Do.percentage}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">F= {stats.F_total} </span>
                  <span className="font-semibold">
                    ,F%={stats.F_percentage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    F+= {stats.determinants.F_plus}{" "}
                  </span>
                  <span className="font-semibold">
                    ,F+%={stats.F_plus_percentage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">F pur.%= {stats.F_pur}</span>
                  <span className="font-semibold">
                    F+ pur.%= {stats.F_plus_pur}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    F+elarg.%= {stats.F_extended_percentage}
                  </span>
                  <span className="font-semibold">
                    F elargi.%= {stats.F_elargi}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    F-= {stats.determinants.F_minus}{" "}
                  </span>
                  <span className="font-semibold">
                    ,F-%={stats.F_minus_percentage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    F+-= {stats.determinants.F_extended}{" "}
                  </span>
                  <span className="font-semibold">
                    ,F+-%={stats.F_extended_percentage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    FC= {stats.determinants.FC}
                  </span>
                  <span className="font-semibold">
                    CF= {stats.determinants.CF}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">
                    C= {stats.determinants.C}
                  </span>
                  <span className="font-semibold">
                    C'= {stats.determinants.C_prime}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">
                    RC%= {stats.RC_percentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Ban= {stats.Ban_count} </span>
                  {/* <span className="font-semibold">
                    ,Ban%={stats.Ban_percentage}
                  </span> */}
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Angoisse= {stats.Angoisse_formula}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">
                    K= {stats.determinants.K}
                  </span>
                  <span className="font-semibold">
                    Kan= {stats.determinants.kan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    KF= {stats.determinants.KF}
                  </span>
                  <span className="font-semibold">
                    FK= {stats.determinants.FK}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">A= {stats.content.A} </span>
                  <span className="font-semibold">
                    ,A%={stats.A_percentage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">H= {stats.content.H} </span>
                  <span className="font-semibold">
                    ,H%={stats.H_percentage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Anat= {stats.content.Anat}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Bot= {stats.content.Bot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Géo= {stats.content.Géo}
                  </span>
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
                <div className="text-sm text-muted-foreground">
                  Total Responses (R)
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stats.F_percentage}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Form Percentage (F%)
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stats.TRI}
                </div>
                <div className="text-sm text-muted-foreground">TRI</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stats.Ban_count}
                </div>
                <div className="text-sm text-muted-foreground">
                  Popular (Ban)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="structural" className="w-full">
          <TabsList className="grid w-full h-full grid-cols-2">
            <TabsTrigger value="structural">Structural Summary</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="determinants">Determinants</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
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
                      <Badge variant="outline">
                        {stats.determinants.F_plus} ({stats.F_plus_percentage}%)
                      </Badge>
                    </div>
                    <Progress value={stats.F_plus_percentage} keyName="F+" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Poor Form (F-)</span>
                      <Badge variant="outline">
                        {stats.determinants.F_minus} ({stats.F_minus_percentage}
                        %)
                      </Badge>
                    </div>
                    <Progress
                      value={stats.F_minus_percentage}
                      keyName="F-"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Extended Form (F+-)</span>
                      <Badge variant="outline">
                        {stats.determinants.F_extended} (
                        {stats.F_extended_percentage}%)
                      </Badge>
                    </div>
                    <Progress value={stats.F_extended_percentage} keyName="F+-" />
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
                  <div className="bg-muted rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">TRI</span>
                      <Badge>{stats.TRI}</Badge>
                    </div>
                    <TRINote TRI={stats.TRI} />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-medium">F.compl</span>
                    <Badge variant="outline">{stats.F_compl}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Ban</span>
                    <Badge>
                      {stats.Ban_count} ({stats.Ban_percentage}%)
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Avg Latency</span>
                    <Badge>{stats.avgLatency}s</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                    <span className="text-sm font-medium">Angoisse</span>
                    <Badge
                      variant={
                        stats.Anat_percentage > 20 ? "destructive" : "secondary"
                      }
                    >
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
                <CardDescription>
                  Distribution of response locations
                </CardDescription>
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
                    <Progress value={value.percentage} keyName={key} className="h-3" />
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      Movement dominates form (KF)
                    </span>
                    <Badge variant="secondary">{stats.determinants.KF}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      Form dominates movement (FK)
                    </span>
                    <Badge variant="secondary">{stats.determinants.FK}</Badge>
                  </div>
                  {/* <div className="mt-4 p-2 bg-muted rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ΣK (K + Kp)</span>
                      <Badge>{stats.sumK}</Badge>
                    </div>
                  </div> */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Color Responses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                    Chromatic
                  </h4>
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

                  <h4 className="text-xs font-semibold text-muted-foreground mt-4 mb-2">
                    Achromatic
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pure achromatic (C')</span>
                    <Badge variant="secondary">
                      {stats.determinants.C_prime}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      Achromatic color dominates form (C'F)
                    </span>
                    <Badge variant="secondary">
                      {stats.determinants.C_primeF}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      Form dominates achromatic color (FC')
                    </span>
                    <Badge variant="secondary">
                      {stats.determinants.FC_prime}
                    </Badge>
                  </div>

                  {/* <div className="mt-4 p-2 bg-muted rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ΣC (weighted)</span>
                      <Badge>{stats.sumC}</Badge>
                    </div>
                  </div> */}
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
                    <Badge variant="secondary">
                      {stats.determinants.ClobF}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">FClob</span>
                    <Badge variant="secondary">
                      {stats.determinants.FClob}
                    </Badge>
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
                    <Progress value={stats.H_percentage} keyName="H" />
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
                    <Progress value={stats.A_percentage} keyName="A" />
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
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="container mx-auto p-4 space-y-6">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </footer>
    </div>
  );
};

export default ResultsPage;
