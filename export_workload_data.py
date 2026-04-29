import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from schedule_parser import extract_records, aggregate_pay_periods, aggregate_monthly, comparison_summary

root = Path(__file__).resolve().parent
df = extract_records(root / 'schedule.xlsx')
pp = aggregate_pay_periods(df)
monthly = aggregate_monthly(df)
summary = comparison_summary(pp)

def clean_df(frame):
    out = frame.copy()
    for col in out.columns:
        out[col] = out[col].map(lambda x: x.isoformat() if hasattr(x, 'isoformat') else x)
    return out.to_dict(orient='records')

payload = {
    'records': clean_df(df),
    'payPeriods': clean_df(pp),
    'monthly': clean_df(monthly),
    'summary': clean_df(summary),
    'staff': sorted(df.person.dropna().unique().tolist()),
    'dateMin': df.date.min().isoformat(),
    'dateMax': df.date.max().isoformat(),
    'assumptions': [
        'Backup shifts count as shifts/backups and contribute 8.0 included hours.',
        'Every worked shift other than TEC and Backup includes 2.0 hours of cleanup time.',
        'Annual leave adjustments are entered interactively in the dashboard by pay period; 3 AL days reduces shift burden by 2 shifts.',
        'Off/Admin entries are retained in detail but excluded from shift and hour totals.',
        'Federal pay periods use the NFC-style 14-day cycle anchored at 2023 PP01 = 2023-01-01.',
        'This audits the schedule grid, not payroll/timecard truth.'
    ]
}
out = root / 'src' / 'app' / 'dashboard' / 'workload-data.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(payload, indent=2))
print(out, out.stat().st_size)
