-- Create permission_metrics table for monitoring
-- Task 25: Create monitoring and alerting

CREATE TABLE IF NOT EXISTS permission_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 1,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
  labels JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_permission_metrics_name_timestamp ON permission_metrics(metric_name, timestamp DESC);
CREATE INDEX idx_permission_metrics_timestamp ON permission_metrics(timestamp DESC);
CREATE INDEX idx_permission_metrics_labels ON permission_metrics USING GIN (labels);

-- Create a function to clean up old metrics (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM permission_metrics
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-metrics', '0 2 * * *', 'SELECT cleanup_old_metrics()');

COMMENT ON TABLE permission_metrics IS 'Stores metrics for course permission operations monitoring';
COMMENT ON COLUMN permission_metrics.metric_name IS 'Name of the metric being tracked';
COMMENT ON COLUMN permission_metrics.metric_value IS 'Numeric value of the metric';
COMMENT ON COLUMN permission_metrics.metric_type IS 'Type of metric: counter, gauge, or histogram';
COMMENT ON COLUMN permission_metrics.labels IS 'Additional labels/dimensions for the metric';
COMMENT ON COLUMN permission_metrics.timestamp IS 'When the metric was recorded';
