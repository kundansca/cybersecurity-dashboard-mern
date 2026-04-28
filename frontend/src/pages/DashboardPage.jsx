import { Column, Line, Pie } from "@ant-design/charts";
import { App, Card, Col, Grid, Row, Spin, Statistic, Typography } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";
import {
  getAdditionsByMonth,
  getCweDistribution,
  getSummary,
  getTopVendors,
} from "../api/client";

dayjs.extend(utc);

function utcDay(iso) {
  return iso ? dayjs.utc(iso).format("YYYY-MM-DD") : "—";
}

export default function DashboardPage() {
  const { message } = App.useApp();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [cwes, setCwes] = useState([]);
  const [months, setMonths] = useState([]);

  useEffect(() => {
    let cancelled = false;
    // first paint + eslint strict mode — delay one tick
    const t = setTimeout(() => {
      (async () => {
        setLoading(true);
        try {
          const [s, v, c, m] = await Promise.all([
            getSummary(),
            getTopVendors(10),
            getCweDistribution(12),
            getAdditionsByMonth(18),
          ]);
          if (cancelled) return;
          setSummary(s.data.data);
          setVendors(v.data.data || []);
          setCwes(c.data.data || []);
          setMonths([...(m.data.data || [])].reverse());
        } catch (e) {
          if (!cancelled) {
            setSummary(null);
            message.error(e?.message || "Could not load stats");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [message]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const ransomware = summary?.byRansomwareCampaignUse || [];

  return (
    <div>
      <Typography.Title level={isMobile ? 4 : 3} style={{ marginTop: 0 }}>
        Dashboard
      </Typography.Title>
      <Typography.Text type="secondary">Charts pull from the same REST API as the table.</Typography.Text>

      <Row gutter={[16, 16]} style={{ marginTop: 16, marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="CVEs loaded" value={summary?.totalVulnerabilities ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Oldest date_added" value={utcDay(summary?.dateAddedRange?.min)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Newest date_added" value={utcDay(summary?.dateAddedRange?.max)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Feed version(s) in DB"
              value={(summary?.catalogVersionsPresent || []).join(", ") || "—"}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="Ransomware field" bordered={false}>
            <Pie
              data={ransomware}
              angleField="count"
              colorField="value"
              radius={0.9}
              innerRadius={0.52}
              label={{ text: "count", style: { fontSize: 11 } }}
              legend={{ position: "bottom" }}
              height={isMobile ? 240 : 300}
            />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Vendors (top 10)" bordered={false}>
            <Column
              data={vendors}
              xField="vendor"
              yField="count"
              height={isMobile ? 240 : 300}
              axis={{ x: { labelAutoRotate: true } }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Entries per month" bordered={false}>
            <Line
              data={months}
              xField="period"
              yField="count"
              height={isMobile ? 220 : 280}
              point={{ size: 3 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="CWEs (top 12)" bordered={false}>
            <Column
              data={cwes}
              xField="cwe"
              yField="count"
              height={isMobile ? 220 : 280}
              axis={{ x: { labelAutoRotate: true } }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
