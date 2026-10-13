import * as React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export type InvoicePdfData = {
  number: string;
  issueDate: string;
  dueDate: string;
  status: string;
  currency: string;
  client: {
    name: string;
    email: string;
    company?: string | null;
    phone?: string | null;
  };
  items: Array<{
    description: string;
    quantity: string;
    price: string;
    total: string;
  }>;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  notes?: string | null;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  brand: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0ea5e9",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
  },
  meta: {
    fontSize: 9,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  colTitle: {
    fontSize: 9,
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  colValue: { fontSize: 11, fontWeight: "bold" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    fontWeight: "bold",
    fontSize: 9,
    borderTopWidth: 1,
    borderColor: "#ddd",
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  cellDescription: { flex: 3, paddingRight: 8 },
  cellNumber: { flex: 1, textAlign: "right", paddingRight: 8 },
  totals: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    paddingVertical: 4,
  },
  totalLabel: { color: "#666" },
  grandTotal: {
    fontSize: 14,
    fontWeight: "bold",
    borderTopWidth: 1,
    borderColor: "#000",
    paddingTop: 6,
    marginTop: 4,
  },
  notes: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#fafafa",
    borderRadius: 4,
    fontSize: 9,
    color: "#444",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
});

export function InvoicePdf({ invoice }: { invoice: InvoicePdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Solvo Tech</Text>
            <Text style={{ fontSize: 9, color: "#666", marginTop: 4 }}>
              hello@solvo.tech
            </Text>
            <Text style={{ fontSize: 9, color: "#666" }}>
              Jakarta, Indonesia
            </Text>
          </View>
          <View>
            <Text style={styles.heading}>INVOICE</Text>
            <Text style={styles.meta}>#{invoice.number}</Text>
            <Text style={styles.meta}>Status: {invoice.status}</Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View>
            <Text style={styles.colTitle}>Bill To</Text>
            <Text style={styles.colValue}>{invoice.client.name}</Text>
            {invoice.client.company ? (
              <Text>{invoice.client.company}</Text>
            ) : null}
            <Text style={{ color: "#666" }}>{invoice.client.email}</Text>
            {invoice.client.phone ? (
              <Text style={{ color: "#666" }}>{invoice.client.phone}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.colTitle}>Tanggal</Text>
            <Text>Issue: {invoice.issueDate}</Text>
            <Text>Due: {invoice.dueDate}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.cellDescription}>Deskripsi</Text>
          <Text style={styles.cellNumber}>Qty</Text>
          <Text style={styles.cellNumber}>Harga</Text>
          <Text style={styles.cellNumber}>Total</Text>
        </View>
        {invoice.items.map((it, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.cellDescription}>{it.description}</Text>
            <Text style={styles.cellNumber}>{it.quantity}</Text>
            <Text style={styles.cellNumber}>{it.price}</Text>
            <Text style={styles.cellNumber}>{it.total}</Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text>{invoice.subtotal}</Text>
          </View>
          {invoice.taxRate !== "0" && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Pajak ({invoice.taxRate}%)</Text>
              <Text>{invoice.taxAmount}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>TOTAL</Text>
            <Text>{invoice.total}</Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={styles.notes}>
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Catatan</Text>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          Terima kasih atas kepercayaan Anda kepada Solvo Tech.
        </Text>
      </Page>
    </Document>
  );
}
