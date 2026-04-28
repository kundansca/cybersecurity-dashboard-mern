import { SearchOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Grid,
  Input,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";
import { getVulnerabilities, getVulnerabilityByCve } from "../api/client";

dayjs.extend(utc);

const { RangePicker } = DatePicker;

function fmtDate(v) {
  return v ? dayjs.utc(v).format("YYYY-MM-DD") : "—";
}

const columns = [
  { title: "CVE ID", dataIndex: "cveID", width: 150, fixed: "left" },
  { title: "Vendor", dataIndex: "vendorProject", ellipsis: true },
  { title: "Product", dataIndex: "product", ellipsis: true },
  { title: "Vulnerability name", dataIndex: "vulnerabilityName", ellipsis: true },
  { title: "Date added", dataIndex: "dateAdded", width: 120, render: fmtDate },
  { title: "Due date", dataIndex: "dueDate", width: 120, render: fmtDate },
  { title: "Ransomware use", dataIndex: "knownRansomwareCampaignUse", width: 130 },
];

export default function VulnerabilitiesPage() {
  const { message } = App.useApp();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  function queryParams(p, ps, values) {
    const v = values ?? form.getFieldsValue();
    const out = {
      page: p,
      limit: ps,
      search: v.search || undefined,
      vendor: v.vendor || undefined,
      product: v.product || undefined,
      ransomware: v.ransomware || undefined,
    };
    if (v.range?.length === 2) {
      out.dateFrom = v.range[0].format("YYYY-MM-DD");
      out.dateTo = v.range[1].format("YYYY-MM-DD");
    }
    return out;
  }

  async function load(p, ps, values) {
    setLoading(true);
    try {
      const res = await getVulnerabilities(queryParams(p, ps, values));
      const body = res.data;
      setRows(body.data || []);
      setTotal(body.meta?.total ?? 0);
      setPage(body.meta?.page ?? p);
      setPageSize(body.meta?.limit ?? ps);
    } catch (e) {
      message.error(e?.message || "List request failed");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(1, 20), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openDrawer(cveId) {
    setDrawerOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await getVulnerabilityByCve(cveId);
      setDetail(res.data.data);
    } catch {
      setDetail(null);
      message.error("Detail fetch failed");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div>
      <Typography.Title level={isMobile ? 4 : 3} style={{ marginTop: 0 }}>
        Vulnerabilities
      </Typography.Title>
      <Typography.Text type="secondary">Row click opens the rest of the fields.</Typography.Text>

      <Card style={{ marginTop: 16, marginBottom: 16 }} bordered={false}>
        <Form form={form} layout="vertical">
          <Row gutter={[16, 8]}>
            <Col xs={24} md={8} lg={6}>
              <Form.Item name="search" label="Search">
                <Input
                  allowClear
                  placeholder="cve / vendor / text"
                  onPressEnter={() => {
                    setPage(1);
                    load(1, pageSize);
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8} lg={5}>
              <Form.Item name="vendor" label="Vendor (exact match)">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={8} lg={5}>
              <Form.Item name="product" label="Product (exact match)">
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={8} lg={4}>
              <Form.Item name="ransomware" label="Ransomware">
                <Select
                  allowClear
                  placeholder="any"
                  options={[
                    { value: "Known", label: "Known" },
                    { value: "Unknown", label: "Unknown" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={16} lg={6}>
              <Form.Item name="range" label="date_added range">
                <RangePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8} style={{ display: "flex", alignItems: "flex-end" }}>
              <Space wrap style={{ width: isMobile ? "100%" : "auto" }}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  block={isMobile}
                  onClick={() => {
                    setPage(1);
                    load(1, pageSize);
                  }}
                >
                  Apply
                </Button>
                <Button
                  block={isMobile}
                  onClick={() => {
                    form.resetFields();
                    setPage(1);
                    setPageSize(20);
                    load(1, 20, {});
                  }}
                >
                  Reset
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card bordered={false}>
        <Table
          rowKey="cveID"
          loading={loading}
          columns={columns}
          dataSource={rows}
          scroll={{ x: isMobile ? 1200 : 1000 }}
          size={isMobile ? "small" : "middle"}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (n) => `${n} total`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
              load(p, ps);
            },
          }}
          onRow={(rec) => ({
            onClick: () => openDrawer(rec.cveID),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      <Drawer
        title={detail?.cveID || "…"}
        width={isMobile ? "100%" : 520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <Typography.Text type="secondary">Loading…</Typography.Text>
        ) : detail ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Vendor">{detail.vendorProject || "—"}</Descriptions.Item>
            <Descriptions.Item label="Product">{detail.product || "—"}</Descriptions.Item>
            <Descriptions.Item label="Title">{detail.vulnerabilityName || "—"}</Descriptions.Item>
            <Descriptions.Item label="Date added">{fmtDate(detail.dateAdded)}</Descriptions.Item>
            <Descriptions.Item label="Due date">{fmtDate(detail.dueDate)}</Descriptions.Item>
            <Descriptions.Item label="Ransomware">{detail.knownRansomwareCampaignUse || "—"}</Descriptions.Item>
            <Descriptions.Item label="CWEs">{(detail.cwes || []).join(", ") || "—"}</Descriptions.Item>
            <Descriptions.Item label="Description">{detail.shortDescription || "—"}</Descriptions.Item>
            <Descriptions.Item label="Required action">{detail.requiredAction || "—"}</Descriptions.Item>
            <Descriptions.Item label="Notes">{detail.notes || "—"}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text type="danger">Could not load this CVE.</Typography.Text>
        )}
      </Drawer>
    </div>
  );
}
