import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";

interface Response {
  id: string;
  card_number: number;
  response_number: number;
  response_text: string;
  location: string | null;
  determinants: string[];
  content_categories: string[];
  c_value: string | null;
  ban: string | null;
  obs: string | null;
  intense_time: number | null;
}

const TableResponse = () => {
  const columns: ColumnDef<Response>[] = [
    {
      accessorKey: "response_number",
      header: "Resp #",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.response_number}</Badge>
      ),
    },
    {
      accessorKey: "card_number",
      header: "Card",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.card_number}</span>
      ),
    },
    {
      accessorKey: "response_text",
      header: "Response Text",
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-2">{row.original.response_text}</p>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.location || "-"}</span>
      ),
    },
    {
      accessorKey: "determinants",
      header: "D",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.determinants.join(", ") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "c_value",
      header: "C",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.c_value || "-"}</span>
      ),
    },
    {
      accessorKey: "ban",
      header: "Ban",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.ban || "-"}</span>
      ),
    },
    {
      accessorKey: "obs",
      header: "Obs",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.obs || "-"}</span>
      ),
    },
    {
      accessorKey: "intense_time",
      header: "Time",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.intense_time ? `${row.original.intense_time}s` : "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteResponse(row.original.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: cardResponses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const deleteResponse = async (responseId: string) => {
    if (!user || !testId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("test_responses")
        .delete()
        .eq("id", responseId);

      if (error) throw error;

      // Update total responses count
      await supabase
        .from("rorschach_tests")
        .update({ total_responses: responses.length - 1 })
        .eq("id", testId);

      toast({
        title: "Response deleted",
        description: "Response successfully removed.",
      });
      loadTestData();
    } catch (error) {
      console.error("Error deleting response:", error);
      toast({
        title: "Error deleting response",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Card {selectedCard} - Recorded Responses</CardTitle>
        <CardDescription>
          {cardResponses.length} response(s) recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No responses recorded for this card yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TableResponse;
