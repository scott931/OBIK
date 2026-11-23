import pathlib
import re

p = pathlib.Path(
    r"c:\Users\SC\.cursor\projects\a-OBIK\attachments\109bcf53-f833-4402-aeff-8858a6fb0f5d\paypal_R37N8ZYEHDZ4G.pdf"
)
text = p.read_bytes().decode("latin1", errors="ignore")
i = text.find("ncp/payment")
print("--- around payment ---")
print(repr(text[max(0, i - 1200) : i + 1800]))
print("===== URLS =====")
for m in re.findall(r"https?://[^\s<>()\\]+", text):
    if "paypal" in m.lower() or "ncp" in m.lower():
        print(m[:400])
