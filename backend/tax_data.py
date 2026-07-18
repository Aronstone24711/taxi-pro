"""Seed data: 45+ countries with tax info and country-specific quiz banks.

Rates reflect commonly cited FY 2024-25 / 2026 baselines and are for education only.
"""

INDIAN_QUIZ = [
    {"q": "What is the standard GST rate in India?", "opts": ["5%", "12%", "18%", "28%"], "correct": 2, "exp": "18% is the standard GST slab in India."},
    {"q": "Under the New Tax Regime (FY 2024-25), income between ₹9L-₹12L is taxed at?", "opts": ["10%", "15%", "20%", "25%"], "correct": 1, "exp": "15% slab was introduced in Budget 2024."},
    {"q": "TDS on salary is deducted under which section?", "opts": ["194A", "194C", "192", "194J"], "correct": 2, "exp": "Section 192 governs TDS on salary."},
    {"q": "LTCG on listed equity above ₹1 lakh is taxed at?", "opts": ["10%", "12.5%", "15%", "20%"], "correct": 1, "exp": "From July 2024, LTCG on equity is 12.5% above ₹1.25L."},
    {"q": "TDS on professional fees (Sec 194J) is charged at?", "opts": ["2%", "5%", "10%", "20%"], "correct": 2, "exp": "10% TDS applies to professional/technical service fees."},
    {"q": "Section 87A rebate under the New Regime makes income tax-free up to?", "opts": ["₹5L", "₹7L", "₹10L", "₹12.5L"], "correct": 1, "exp": "Rebate makes income up to ₹7 lakh tax-free."},
    {"q": "Advance Tax must be paid if total tax liability exceeds?", "opts": ["₹5,000", "₹10,000", "₹15,000", "₹20,000"], "correct": 1, "exp": "Threshold is ₹10,000 after TDS."},
    {"q": "The maximum deduction under Section 80C is?", "opts": ["₹1 lakh", "₹1.5 lakh", "₹2 lakh", "₹2.5 lakh"], "correct": 1, "exp": "₹1.5 lakh combined 80C ceiling."},
    {"q": "Standard deduction for salaried individuals in FY 2024-25 (New Regime)?", "opts": ["₹40,000", "₹50,000", "₹75,000", "₹1,00,000"], "correct": 2, "exp": "Raised to ₹75,000 under the New Regime in Budget 2024."},
    {"q": "Health insurance premium deduction (Section 80D) for self+family under 60?", "opts": ["₹15,000", "₹25,000", "₹50,000", "₹75,000"], "correct": 1, "exp": "₹25,000 for self/family; ₹50,000 for senior citizens."},
    {"q": "HRA exemption is calculated as least of three: rent paid minus 10% of salary, actual HRA, and?", "opts": ["30% of basic", "40%/50% of salary", "60% of salary", "100% of rent"], "correct": 1, "exp": "50% of salary for metro, 40% for non-metro."},
    {"q": "PPF has a lock-in of?", "opts": ["5 years", "7 years", "10 years", "15 years"], "correct": 3, "exp": "PPF matures after 15 years."},
    {"q": "Filing deadline for individuals (non-audit) in India is typically?", "opts": ["March 31", "July 31", "September 30", "December 31"], "correct": 1, "exp": "July 31 of the assessment year."},
    {"q": "Surcharge under the New Regime is capped at?", "opts": ["10%", "15%", "25%", "37%"], "correct": 2, "exp": "New regime caps surcharge at 25% (vs 37% old)."},
    {"q": "Basic exemption limit in the New Regime (FY 2024-25)?", "opts": ["₹2.5L", "₹3L", "₹5L", "₹7L"], "correct": 1, "exp": "₹3 lakh in the New Regime."},
]

COUNTRIES = [
    {"key": "🇮🇳 India", "region": "Asia", "info": {"type": "Progressive", "personal": "0-30%", "corp": "22-30%", "consumption": "5-28% GST", "filing": "Jul 31"}, "notes": "Two regimes (Old & New). New has lower rates but fewer deductions.", "quiz": [
        {"q": "India's fiscal year runs from?", "opts": ["Jan-Dec", "Apr-Mar", "Jul-Jun", "Oct-Sep"], "correct": 1, "exp": "April 1 to March 31."},
        {"q": "Corporate tax for new domestic manufacturers (Sec 115BAB)?", "opts": ["10%", "15%", "22%", "25%"], "correct": 1, "exp": "15% concessional rate."},
        {"q": "GST is collected by?", "opts": ["Only Centre", "Only State", "Centre + State", "None"], "correct": 2, "exp": "Dual GST — CGST + SGST/IGST."},
    ]},
    {"key": "🇺🇸 USA", "region": "Americas", "info": {"type": "Progressive", "personal": "10-37%", "corp": "21%", "consumption": "0-11% Sales Tax", "filing": "Apr 15"}, "notes": "Federal + State taxes. Sales tax varies by state; no VAT.", "quiz": [
        {"q": "USA federal corporate tax rate is?", "opts": ["15%", "21%", "28%", "35%"], "correct": 1, "exp": "Flat 21% since TCJA 2017."},
        {"q": "Top marginal federal income tax bracket?", "opts": ["32%", "35%", "37%", "39.6%"], "correct": 2, "exp": "37% is the top federal rate."},
        {"q": "US tax filing deadline is typically?", "opts": ["Mar 15", "Apr 15", "Jun 30", "Dec 31"], "correct": 1, "exp": "April 15 (or next business day)."},
    ]},
    {"key": "🇬🇧 UK", "region": "Europe", "info": {"type": "Progressive", "personal": "0-45%", "corp": "19-25%", "consumption": "20% VAT", "filing": "Jan 31 (online)"}, "notes": "Personal allowance £12,570. ISA gives tax-free investment growth.", "quiz": [
        {"q": "UK personal allowance (tax-free) is?", "opts": ["£10,000", "£12,570", "£15,000", "£20,000"], "correct": 1, "exp": "£12,570 for most taxpayers."},
        {"q": "UK VAT standard rate is?", "opts": ["15%", "17.5%", "20%", "23%"], "correct": 2, "exp": "20% standard VAT."},
        {"q": "UK corporate tax main rate (profits > £250k)?", "opts": ["19%", "21%", "25%", "28%"], "correct": 2, "exp": "25% since April 2023."},
    ]},
    {"key": "🇦🇪 UAE", "region": "Middle East", "info": {"type": "None (personal)", "personal": "0%", "corp": "9%", "consumption": "5% VAT", "filing": "N/A (personal)"}, "notes": "No personal income tax. 9% corporate tax on profits over AED 375k (2023+).", "quiz": [
        {"q": "Personal income tax in UAE?", "opts": ["0%", "5%", "10%", "15%"], "correct": 0, "exp": "No personal income tax."},
        {"q": "UAE VAT rate?", "opts": ["0%", "5%", "10%", "15%"], "correct": 1, "exp": "5% since 2018."},
        {"q": "UAE Corporate Tax threshold (0% below)?", "opts": ["AED 100k", "AED 200k", "AED 375k", "AED 500k"], "correct": 2, "exp": "0% up to AED 375,000; 9% above."},
    ]},
    {"key": "🇸🇬 Singapore", "region": "Asia", "info": {"type": "Progressive", "personal": "0-24%", "corp": "17%", "consumption": "9% GST", "filing": "Apr 18"}, "notes": "Territorial tax system. No capital gains tax.", "quiz": [
        {"q": "Singapore top personal income tax rate?", "opts": ["17%", "22%", "24%", "30%"], "correct": 2, "exp": "24% top rate from YA 2024."},
        {"q": "Singapore corporate tax rate?", "opts": ["15%", "17%", "20%", "25%"], "correct": 1, "exp": "Flat 17%."},
        {"q": "Singapore GST rate (2024)?", "opts": ["5%", "7%", "9%", "10%"], "correct": 2, "exp": "Raised to 9% from Jan 2024."},
    ]},
    {"key": "🇩🇪 Germany", "region": "Europe", "info": {"type": "Progressive", "personal": "0-45%", "corp": "~30%", "consumption": "19% VAT", "filing": "Jul 31"}, "notes": "Includes solidarity surcharge & church tax. High social security.", "quiz": [
        {"q": "Germany top personal tax rate (before soli)?", "opts": ["35%", "42%", "45%", "50%"], "correct": 2, "exp": "45% for very high incomes."},
        {"q": "Germany VAT standard rate?", "opts": ["16%", "19%", "21%", "23%"], "correct": 1, "exp": "19% standard VAT."},
        {"q": "German tax year is?", "opts": ["Apr-Mar", "Jan-Dec", "Jul-Jun", "Oct-Sep"], "correct": 1, "exp": "Calendar year."},
    ]},
    {"key": "🇨🇦 Canada", "region": "Americas", "info": {"type": "Progressive", "personal": "15-33% (fed)", "corp": "15% (fed)", "consumption": "5-15% GST/HST", "filing": "Apr 30"}, "notes": "Federal + Provincial. TFSA & RRSP for tax-advantaged saving.", "quiz": [
        {"q": "Federal top marginal tax rate in Canada?", "opts": ["29%", "33%", "38%", "45%"], "correct": 1, "exp": "33% federal (provinces add more)."},
        {"q": "Canada tax filing deadline for individuals?", "opts": ["Mar 31", "Apr 30", "Jun 15", "Dec 31"], "correct": 1, "exp": "April 30."},
        {"q": "TFSA 2024 annual contribution limit?", "opts": ["$5,000", "$6,500", "$7,000", "$10,000"], "correct": 2, "exp": "$7,000 in 2024."},
    ]},
    {"key": "🇦🇺 Australia", "region": "Oceania", "info": {"type": "Progressive", "personal": "0-45%", "corp": "25-30%", "consumption": "10% GST", "filing": "Oct 31"}, "notes": "Financial year July-June. Superannuation is compulsory.", "quiz": [
        {"q": "Australian financial year runs?", "opts": ["Jan-Dec", "Apr-Mar", "Jul-Jun", "Oct-Sep"], "correct": 2, "exp": "July 1 to June 30."},
        {"q": "Top personal tax rate in Australia?", "opts": ["37%", "45%", "50%", "55%"], "correct": 1, "exp": "45% plus 2% Medicare levy."},
        {"q": "Australia GST rate?", "opts": ["5%", "8%", "10%", "15%"], "correct": 2, "exp": "10% GST."},
    ]},
    {"key": "🇫🇷 France", "region": "Europe", "info": {"type": "Progressive", "personal": "0-45%", "corp": "25%", "consumption": "20% VAT", "filing": "May-Jun"}, "notes": "Wealth tax on real estate (IFI) above €1.3M.", "quiz": [
        {"q": "France standard VAT rate?", "opts": ["15%", "18%", "20%", "22%"], "correct": 2, "exp": "20% standard."},
        {"q": "France corporate tax rate?", "opts": ["20%", "25%", "28%", "33%"], "correct": 1, "exp": "25% since 2022."},
        {"q": "IFI wealth tax applies to real estate above?", "opts": ["€500k", "€800k", "€1.3M", "€3M"], "correct": 2, "exp": "€1.3 million threshold."},
    ]},
    {"key": "🇯🇵 Japan", "region": "Asia", "info": {"type": "Progressive", "personal": "5-45%", "corp": "~30%", "consumption": "10% Consumption Tax", "filing": "Mar 15"}, "notes": "National + Local (Prefectural + Municipal). Reconstruction surtax applies.", "quiz": [
        {"q": "Japan consumption tax rate?", "opts": ["5%", "8%", "10%", "12%"], "correct": 2, "exp": "10% since 2019."},
        {"q": "Japan top individual national tax rate?", "opts": ["33%", "40%", "45%", "50%"], "correct": 2, "exp": "45% top national rate."},
        {"q": "Japan tax filing deadline?", "opts": ["Feb 28", "Mar 15", "Apr 15", "Jul 31"], "correct": 1, "exp": "March 15."},
    ]},
    {"key": "🇨🇳 China", "region": "Asia", "info": {"type": "Progressive", "personal": "3-45%", "corp": "25%", "consumption": "13% VAT", "filing": "Jun 30"}, "notes": "Global taxation for residents. Special expat allowances.", "quiz": [
        {"q": "China top individual income tax rate?", "opts": ["35%", "40%", "45%", "50%"], "correct": 2, "exp": "45% top marginal rate."},
        {"q": "China corporate income tax standard rate?", "opts": ["15%", "20%", "25%", "30%"], "correct": 2, "exp": "25% standard CIT."},
        {"q": "China VAT standard rate?", "opts": ["6%", "9%", "13%", "17%"], "correct": 2, "exp": "13% standard VAT."},
    ]},
    {"key": "🇧🇷 Brazil", "region": "Americas", "info": {"type": "Progressive", "personal": "0-27.5%", "corp": "34% total", "consumption": "17-25% ICMS+", "filing": "Apr 30"}, "notes": "Complex system with federal + state + municipal taxes.", "quiz": [
        {"q": "Brazil top personal tax rate?", "opts": ["22.5%", "25%", "27.5%", "30%"], "correct": 2, "exp": "27.5% top rate."},
        {"q": "Brazil combined corporate tax (IRPJ + CSLL)?", "opts": ["25%", "30%", "34%", "40%"], "correct": 2, "exp": "34% total."},
        {"q": "Main state-level consumption tax?", "opts": ["ISS", "ICMS", "IPI", "PIS"], "correct": 1, "exp": "ICMS varies by state."},
    ]},
    {"key": "🇷🇺 Russia", "region": "Europe", "info": {"type": "Flat/Prog.", "personal": "13-22%", "corp": "20%", "consumption": "20% VAT", "filing": "Apr 30"}, "notes": "Progressive brackets introduced 2025 for higher incomes.", "quiz": [
        {"q": "Russia standard personal tax rate?", "opts": ["10%", "13%", "20%", "25%"], "correct": 1, "exp": "13% (higher rates on high incomes from 2025)."},
        {"q": "Russia VAT rate?", "opts": ["15%", "18%", "20%", "22%"], "correct": 2, "exp": "20% since 2019."},
        {"q": "Russia corporate profit tax?", "opts": ["15%", "18%", "20%", "25%"], "correct": 2, "exp": "20% standard CIT."},
    ]},
    {"key": "🇲🇽 Mexico", "region": "Americas", "info": {"type": "Progressive", "personal": "1.92-35%", "corp": "30%", "consumption": "16% IVA", "filing": "Apr 30"}, "notes": "IVA (VAT) at 16%. 0% at northern/southern border zones.", "quiz": [
        {"q": "Mexico VAT (IVA) standard rate?", "opts": ["10%", "13%", "16%", "20%"], "correct": 2, "exp": "16% IVA standard."},
        {"q": "Mexico top personal income tax rate?", "opts": ["30%", "32%", "35%", "40%"], "correct": 2, "exp": "35% top rate."},
        {"q": "Mexico corporate income tax rate?", "opts": ["20%", "25%", "30%", "35%"], "correct": 2, "exp": "30% flat CIT."},
    ]},
    {"key": "🇮🇹 Italy", "region": "Europe", "info": {"type": "Progressive", "personal": "23-43%", "corp": "24%", "consumption": "22% IVA", "filing": "Sep 30"}, "notes": "IRES 24% + IRAP ~3.9% for companies.", "quiz": [
        {"q": "Italy VAT (IVA) standard rate?", "opts": ["19%", "20%", "21%", "22%"], "correct": 3, "exp": "22% standard IVA."},
        {"q": "Italy top personal tax rate?", "opts": ["35%", "38%", "43%", "45%"], "correct": 2, "exp": "43% for income > €50k."},
        {"q": "Italy corporate income tax (IRES)?", "opts": ["20%", "24%", "27%", "30%"], "correct": 1, "exp": "24% IRES."},
    ]},
    {"key": "🇪🇸 Spain", "region": "Europe", "info": {"type": "Progressive", "personal": "19-47%", "corp": "25%", "consumption": "21% VAT", "filing": "Jun 30"}, "notes": "Regional variations. Beckham Law offers flat 24% for expats.", "quiz": [
        {"q": "Spain VAT (IVA) standard rate?", "opts": ["18%", "19%", "21%", "23%"], "correct": 2, "exp": "21% standard."},
        {"q": "Spain top personal tax rate?", "opts": ["40%", "45%", "47%", "50%"], "correct": 2, "exp": "47% (state + regional combined)."},
        {"q": "Spanish 'Beckham Law' flat rate for expats?", "opts": ["19%", "24%", "30%", "35%"], "correct": 1, "exp": "24% flat on Spanish source income."},
    ]},
    {"key": "🇳🇱 Netherlands", "region": "Europe", "info": {"type": "Progressive", "personal": "36.97-49.5%", "corp": "19-25.8%", "consumption": "21% VAT", "filing": "May 1"}, "notes": "Box system: labor, savings, other income. 30% ruling for skilled expats.", "quiz": [
        {"q": "Netherlands top personal tax rate?", "opts": ["42%", "45%", "49.5%", "52%"], "correct": 2, "exp": "49.5% top rate on labor income."},
        {"q": "Netherlands VAT rate?", "opts": ["18%", "19%", "21%", "23%"], "correct": 2, "exp": "21% standard."},
        {"q": "Netherlands corporate tax rate on profits > €200k?", "opts": ["15%", "19%", "25.8%", "30%"], "correct": 2, "exp": "25.8% top corporate rate."},
    ]},
    {"key": "🇨🇭 Switzerland", "region": "Europe", "info": {"type": "Progressive", "personal": "0-40% total", "corp": "12-21%", "consumption": "8.1% VAT", "filing": "Mar 31"}, "notes": "Federal + Cantonal + Municipal taxes. Low VAT.", "quiz": [
        {"q": "Switzerland VAT rate?", "opts": ["7.7%", "8.1%", "10%", "15%"], "correct": 1, "exp": "8.1% since Jan 2024."},
        {"q": "Effective corporate tax rate (combined) is roughly?", "opts": ["12-21%", "25-30%", "30-35%", "35-40%"], "correct": 0, "exp": "12-21% depending on canton."},
        {"q": "Federal direct tax is capped around?", "opts": ["11.5%", "20%", "25%", "30%"], "correct": 0, "exp": "11.5% max at the federal level."},
    ]},
    {"key": "🇸🇪 Sweden", "region": "Europe", "info": {"type": "Progressive", "personal": "32-52%", "corp": "20.6%", "consumption": "25% VAT", "filing": "May 2"}, "notes": "High income tax + generous social benefits. State + municipal.", "quiz": [
        {"q": "Sweden VAT standard rate?", "opts": ["19%", "22%", "25%", "27%"], "correct": 2, "exp": "25% standard VAT."},
        {"q": "Sweden top personal tax rate (approx)?", "opts": ["42%", "48%", "52%", "60%"], "correct": 2, "exp": "~52% combined."},
        {"q": "Sweden corporate income tax rate?", "opts": ["17.5%", "20.6%", "25%", "28%"], "correct": 1, "exp": "20.6% since 2021."},
    ]},
    {"key": "🇳🇴 Norway", "region": "Europe", "info": {"type": "Progressive", "personal": "0-47.4%", "corp": "22%", "consumption": "25% VAT", "filing": "Apr 30"}, "notes": "Wealth tax + special petroleum tax regime.", "quiz": [
        {"q": "Norway corporate tax rate?", "opts": ["18%", "22%", "25%", "28%"], "correct": 1, "exp": "22% general CIT."},
        {"q": "Norway VAT standard rate?", "opts": ["20%", "22%", "25%", "27%"], "correct": 2, "exp": "25% standard."},
        {"q": "Norway top personal tax rate roughly?", "opts": ["38%", "42%", "47%", "55%"], "correct": 2, "exp": "~47.4% top marginal."},
    ]},
    {"key": "🇩🇰 Denmark", "region": "Europe", "info": {"type": "Progressive", "personal": "8-55.9%", "corp": "22%", "consumption": "25% VAT", "filing": "May 1"}, "notes": "One of highest personal tax rates globally. Includes church tax.", "quiz": [
        {"q": "Denmark top personal tax rate?", "opts": ["45%", "50%", "55.9%", "60%"], "correct": 2, "exp": "~55.9% top marginal."},
        {"q": "Denmark VAT (moms) rate?", "opts": ["20%", "22%", "25%", "28%"], "correct": 2, "exp": "25% flat."},
        {"q": "Denmark corporate tax rate?", "opts": ["20%", "22%", "25%", "28%"], "correct": 1, "exp": "22% flat CIT."},
    ]},
    {"key": "🇮🇪 Ireland", "region": "Europe", "info": {"type": "Progressive", "personal": "20-40%", "corp": "12.5%", "consumption": "23% VAT", "filing": "Oct 31"}, "notes": "Low corporate tax attracts multinationals. New 15% for large MNEs.", "quiz": [
        {"q": "Ireland standard corporate tax rate?", "opts": ["10%", "12.5%", "15%", "20%"], "correct": 1, "exp": "12.5% trading rate."},
        {"q": "Ireland VAT standard rate?", "opts": ["19%", "21%", "23%", "25%"], "correct": 2, "exp": "23% standard."},
        {"q": "Ireland top personal income tax rate?", "opts": ["35%", "40%", "45%", "50%"], "correct": 1, "exp": "40% (plus USC and PRSI)."},
    ]},
    {"key": "🇵🇱 Poland", "region": "Europe", "info": {"type": "Progressive", "personal": "12-32%", "corp": "9-19%", "consumption": "23% VAT", "filing": "Apr 30"}, "notes": "Small businesses may qualify for 9% CIT.", "quiz": [
        {"q": "Poland VAT standard rate?", "opts": ["20%", "21%", "23%", "25%"], "correct": 2, "exp": "23% standard."},
        {"q": "Poland small business CIT?", "opts": ["5%", "9%", "12%", "15%"], "correct": 1, "exp": "9% for small taxpayers."},
        {"q": "Poland top personal tax bracket?", "opts": ["25%", "28%", "32%", "40%"], "correct": 2, "exp": "32% above ~PLN 120k."},
    ]},
    {"key": "🇹🇷 Turkey", "region": "Europe", "info": {"type": "Progressive", "personal": "15-40%", "corp": "25%", "consumption": "20% KDV", "filing": "Mar 31"}, "notes": "KDV (VAT) raised to 20% in July 2023.", "quiz": [
        {"q": "Turkey VAT (KDV) standard rate?", "opts": ["15%", "18%", "20%", "22%"], "correct": 2, "exp": "20% since Jul 2023."},
        {"q": "Turkey corporate tax rate (2024)?", "opts": ["20%", "22%", "25%", "30%"], "correct": 2, "exp": "25% general CIT."},
        {"q": "Turkey top personal income tax?", "opts": ["30%", "35%", "40%", "45%"], "correct": 2, "exp": "40% top rate."},
    ]},
    {"key": "🇿🇦 South Africa", "region": "Africa", "info": {"type": "Progressive", "personal": "18-45%", "corp": "27%", "consumption": "15% VAT", "filing": "Oct/Nov"}, "notes": "Residency-based tax with foreign income exemption up to R1.25m.", "quiz": [
        {"q": "South Africa VAT rate?", "opts": ["12%", "14%", "15%", "18%"], "correct": 2, "exp": "15% VAT."},
        {"q": "South Africa corporate tax rate?", "opts": ["25%", "27%", "28%", "30%"], "correct": 1, "exp": "27% from 2023."},
        {"q": "South Africa top personal tax rate?", "opts": ["36%", "40%", "45%", "50%"], "correct": 2, "exp": "45% top marginal."},
    ]},
    {"key": "🇳🇬 Nigeria", "region": "Africa", "info": {"type": "Progressive", "personal": "7-24%", "corp": "30%", "consumption": "7.5% VAT", "filing": "Mar 31"}, "notes": "Small companies (<₦25M) at 0% CIT.", "quiz": [
        {"q": "Nigeria VAT rate?", "opts": ["5%", "7.5%", "10%", "15%"], "correct": 1, "exp": "7.5% since 2020."},
        {"q": "Nigeria CIT for large companies?", "opts": ["20%", "25%", "30%", "35%"], "correct": 2, "exp": "30% standard CIT."},
        {"q": "Nigeria top personal tax rate?", "opts": ["19%", "24%", "30%", "35%"], "correct": 1, "exp": "24% top personal bracket."},
    ]},
    {"key": "🇰🇪 Kenya", "region": "Africa", "info": {"type": "Progressive", "personal": "10-35%", "corp": "30%", "consumption": "16% VAT", "filing": "Jun 30"}, "notes": "PAYE for employees, monthly filing.", "quiz": [
        {"q": "Kenya VAT standard rate?", "opts": ["12%", "14%", "16%", "18%"], "correct": 2, "exp": "16% VAT."},
        {"q": "Kenya corporate income tax rate?", "opts": ["25%", "27%", "30%", "35%"], "correct": 2, "exp": "30% for residents."},
        {"q": "Kenya top personal tax rate (2024)?", "opts": ["30%", "32.5%", "35%", "40%"], "correct": 2, "exp": "35% top bracket from 2024."},
    ]},
    {"key": "🇸🇦 Saudi Arabia", "region": "Middle East", "info": {"type": "None (personal)", "personal": "0%", "corp": "20%", "consumption": "15% VAT", "filing": "N/A (personal)"}, "notes": "No personal income tax for residents. Zakat for Saudi/GCC entities.", "quiz": [
        {"q": "Saudi Arabia personal income tax?", "opts": ["0%", "5%", "10%", "15%"], "correct": 0, "exp": "No personal income tax."},
        {"q": "Saudi Arabia VAT rate (2024)?", "opts": ["5%", "10%", "15%", "18%"], "correct": 2, "exp": "15% since Jul 2020."},
        {"q": "Saudi corporate tax rate (non-Saudi shareholders)?", "opts": ["15%", "20%", "25%", "30%"], "correct": 1, "exp": "20% CIT for foreign shareholders."},
    ]},
    {"key": "🇰🇷 South Korea", "region": "Asia", "info": {"type": "Progressive", "personal": "6-45%", "corp": "9-24%", "consumption": "10% VAT", "filing": "May 31"}, "notes": "Local income tax adds ~10% surtax.", "quiz": [
        {"q": "South Korea VAT rate?", "opts": ["7%", "8%", "10%", "12%"], "correct": 2, "exp": "10% standard VAT."},
        {"q": "Korea top personal income tax?", "opts": ["38%", "42%", "45%", "50%"], "correct": 2, "exp": "45% top marginal."},
        {"q": "Korea top corporate tax rate?", "opts": ["20%", "22%", "24%", "27%"], "correct": 2, "exp": "24% top CIT rate."},
    ]},
    {"key": "🇮🇩 Indonesia", "region": "Asia", "info": {"type": "Progressive", "personal": "5-35%", "corp": "22%", "consumption": "11% VAT", "filing": "Mar 31"}, "notes": "VAT increased to 11% in 2022; 12% planned.", "quiz": [
        {"q": "Indonesia VAT rate (2024)?", "opts": ["10%", "11%", "12%", "15%"], "correct": 1, "exp": "11% since 2022."},
        {"q": "Indonesia CIT rate?", "opts": ["20%", "22%", "25%", "28%"], "correct": 1, "exp": "22% since 2022."},
        {"q": "Indonesia top personal income tax?", "opts": ["30%", "32%", "35%", "40%"], "correct": 2, "exp": "35% for income > IDR 5 bn."},
    ]},
    {"key": "🇹🇭 Thailand", "region": "Asia", "info": {"type": "Progressive", "personal": "0-35%", "corp": "20%", "consumption": "7% VAT", "filing": "Mar 31"}, "notes": "Progressive brackets; low VAT.", "quiz": [
        {"q": "Thailand VAT rate?", "opts": ["5%", "7%", "10%", "12%"], "correct": 1, "exp": "7% (reduced from 10% temporarily, extended)."},
        {"q": "Thailand corporate income tax rate?", "opts": ["15%", "20%", "25%", "30%"], "correct": 1, "exp": "20% standard CIT."},
        {"q": "Thailand top personal tax rate?", "opts": ["25%", "30%", "35%", "40%"], "correct": 2, "exp": "35% top bracket."},
    ]},
    {"key": "🇵🇭 Philippines", "region": "Asia", "info": {"type": "Progressive", "personal": "0-35%", "corp": "20-25%", "consumption": "12% VAT", "filing": "Apr 15"}, "notes": "Small MSME corporations at 20% CIT.", "quiz": [
        {"q": "Philippines VAT rate?", "opts": ["10%", "12%", "15%", "18%"], "correct": 1, "exp": "12% VAT."},
        {"q": "Philippines top personal tax rate?", "opts": ["30%", "32%", "35%", "40%"], "correct": 2, "exp": "35% top bracket."},
        {"q": "Philippines general corporate tax rate?", "opts": ["20%", "22%", "25%", "30%"], "correct": 2, "exp": "25% for large corps (20% for MSME)."},
    ]},
    {"key": "🇻🇳 Vietnam", "region": "Asia", "info": {"type": "Progressive", "personal": "5-35%", "corp": "20%", "consumption": "10% VAT", "filing": "Mar 31"}, "notes": "20% flat corporate rate.", "quiz": [
        {"q": "Vietnam VAT standard rate?", "opts": ["5%", "8%", "10%", "12%"], "correct": 2, "exp": "10% (temp reduced to 8% for some goods)."},
        {"q": "Vietnam corporate income tax?", "opts": ["18%", "20%", "25%", "28%"], "correct": 1, "exp": "20% standard CIT."},
        {"q": "Vietnam top personal tax rate?", "opts": ["25%", "30%", "35%", "40%"], "correct": 2, "exp": "35% top bracket."},
    ]},
    {"key": "🇲🇾 Malaysia", "region": "Asia", "info": {"type": "Progressive", "personal": "0-30%", "corp": "17-24%", "consumption": "6-8% SST", "filing": "Apr 30"}, "notes": "Sales & Service Tax (SST) replaced GST in 2018.", "quiz": [
        {"q": "Malaysia standard corporate tax rate?", "opts": ["17%", "20%", "24%", "28%"], "correct": 2, "exp": "24% (17% for SMEs on first RM 600k)."},
        {"q": "Malaysia SST service tax rate (2024)?", "opts": ["6%", "8%", "10%", "12%"], "correct": 1, "exp": "Raised to 8% Mar 2024."},
        {"q": "Malaysia top personal tax rate?", "opts": ["25%", "28%", "30%", "35%"], "correct": 2, "exp": "30% top bracket."},
    ]},
    {"key": "🇵🇰 Pakistan", "region": "Asia", "info": {"type": "Progressive", "personal": "0-35%", "corp": "29%", "consumption": "18% Sales Tax", "filing": "Sep 30"}, "notes": "High sales tax on goods.", "quiz": [
        {"q": "Pakistan standard sales tax rate?", "opts": ["15%", "17%", "18%", "20%"], "correct": 2, "exp": "18% since Feb 2023."},
        {"q": "Pakistan CIT (companies)?", "opts": ["25%", "29%", "32%", "35%"], "correct": 1, "exp": "29% for tax year 2024."},
        {"q": "Pakistan top personal tax rate?", "opts": ["30%", "32.5%", "35%", "40%"], "correct": 2, "exp": "35% for salaried; higher for others."},
    ]},
    {"key": "🇧🇩 Bangladesh", "region": "Asia", "info": {"type": "Progressive", "personal": "0-30%", "corp": "27.5%", "consumption": "15% VAT", "filing": "Nov 30"}, "notes": "Different corp rates for listed/unlisted.", "quiz": [
        {"q": "Bangladesh standard VAT rate?", "opts": ["10%", "12%", "15%", "18%"], "correct": 2, "exp": "15% VAT."},
        {"q": "Bangladesh CIT for non-listed public companies?", "opts": ["20%", "25%", "27.5%", "30%"], "correct": 2, "exp": "27.5% (reduced from earlier)."},
        {"q": "Bangladesh top personal tax rate?", "opts": ["25%", "27.5%", "30%", "32%"], "correct": 2, "exp": "30% top bracket."},
    ]},
    {"key": "🇳🇿 New Zealand", "region": "Oceania", "info": {"type": "Progressive", "personal": "10.5-39%", "corp": "28%", "consumption": "15% GST", "filing": "Jul 7"}, "notes": "No capital gains tax on most personal investments.", "quiz": [
        {"q": "New Zealand GST rate?", "opts": ["10%", "12.5%", "15%", "18%"], "correct": 2, "exp": "15% GST."},
        {"q": "New Zealand corporate tax rate?", "opts": ["25%", "27%", "28%", "30%"], "correct": 2, "exp": "28% flat CIT."},
        {"q": "New Zealand top personal tax rate?", "opts": ["33%", "35%", "39%", "45%"], "correct": 2, "exp": "39% top marginal."},
    ]},
    {"key": "🇦🇷 Argentina", "region": "Americas", "info": {"type": "Progressive", "personal": "5-35%", "corp": "25-35%", "consumption": "21% IVA", "filing": "Jun"}, "notes": "High inflation impacts brackets; frequent adjustments.", "quiz": [
        {"q": "Argentina VAT (IVA) standard rate?", "opts": ["18%", "19%", "21%", "23%"], "correct": 2, "exp": "21% IVA."},
        {"q": "Argentina top corporate tax rate?", "opts": ["25%", "30%", "35%", "40%"], "correct": 2, "exp": "35% top bracket for large earnings."},
        {"q": "Argentina top personal tax rate?", "opts": ["30%", "35%", "40%", "45%"], "correct": 1, "exp": "35% top marginal."},
    ]},
    {"key": "🇨🇱 Chile", "region": "Americas", "info": {"type": "Progressive", "personal": "0-40%", "corp": "25-27%", "consumption": "19% IVA", "filing": "Apr 30"}, "notes": "Integrated system between corporate & personal.", "quiz": [
        {"q": "Chile VAT rate?", "opts": ["17%", "19%", "21%", "23%"], "correct": 1, "exp": "19% IVA."},
        {"q": "Chile top personal tax rate?", "opts": ["35%", "38%", "40%", "45%"], "correct": 2, "exp": "40% top marginal."},
        {"q": "Chile general corporate tax rate?", "opts": ["20%", "25%", "27%", "30%"], "correct": 2, "exp": "27% under the semi-integrated regime."},
    ]},
    {"key": "🇨🇴 Colombia", "region": "Americas", "info": {"type": "Progressive", "personal": "0-39%", "corp": "35%", "consumption": "19% IVA", "filing": "Aug-Oct"}, "notes": "Financial transaction tax exists.", "quiz": [
        {"q": "Colombia CIT rate?", "opts": ["25%", "30%", "33%", "35%"], "correct": 3, "exp": "35% since 2022."},
        {"q": "Colombia VAT (IVA)?", "opts": ["16%", "18%", "19%", "21%"], "correct": 2, "exp": "19% standard."},
        {"q": "Colombia top personal tax rate?", "opts": ["33%", "35%", "39%", "45%"], "correct": 2, "exp": "39% top marginal."},
    ]},
    {"key": "🇪🇬 Egypt", "region": "Africa", "info": {"type": "Progressive", "personal": "0-27.5%", "corp": "22.5%", "consumption": "14% VAT", "filing": "Mar 31"}, "notes": "Higher rates apply to specific industries.", "quiz": [
        {"q": "Egypt VAT rate?", "opts": ["10%", "12%", "14%", "18%"], "correct": 2, "exp": "14% VAT."},
        {"q": "Egypt corporate tax rate?", "opts": ["20%", "22.5%", "25%", "30%"], "correct": 1, "exp": "22.5% standard CIT."},
        {"q": "Egypt top personal tax rate?", "opts": ["22.5%", "25%", "27.5%", "30%"], "correct": 2, "exp": "27.5% top bracket."},
    ]},
    {"key": "🇦🇹 Austria", "region": "Europe", "info": {"type": "Progressive", "personal": "0-55%", "corp": "23%", "consumption": "20% VAT", "filing": "Apr 30"}, "notes": "High top marginal rate; CIT reduced to 23% in 2024.", "quiz": [
        {"q": "Austria VAT rate?", "opts": ["18%", "19%", "20%", "22%"], "correct": 2, "exp": "20% standard."},
        {"q": "Austria CIT (2024)?", "opts": ["20%", "23%", "25%", "28%"], "correct": 1, "exp": "23% (from 24% in 2023, 25% earlier)."},
        {"q": "Austria top personal tax rate?", "opts": ["45%", "50%", "55%", "60%"], "correct": 2, "exp": "55% for income > €1m."},
    ]},
    {"key": "🇧🇪 Belgium", "region": "Europe", "info": {"type": "Progressive", "personal": "25-50%", "corp": "25%", "consumption": "21% VAT", "filing": "Jun/Jul"}, "notes": "Municipal surcharges add ~5-9%.", "quiz": [
        {"q": "Belgium top personal tax rate?", "opts": ["40%", "45%", "50%", "55%"], "correct": 2, "exp": "50% top marginal (+ municipal)."},
        {"q": "Belgium VAT rate?", "opts": ["19%", "20%", "21%", "23%"], "correct": 2, "exp": "21% standard VAT."},
        {"q": "Belgium corporate tax rate?", "opts": ["20%", "25%", "28%", "30%"], "correct": 1, "exp": "25% since 2020."},
    ]},
    {"key": "🇵🇹 Portugal", "region": "Europe", "info": {"type": "Progressive", "personal": "13.25-48%", "corp": "21%", "consumption": "23% VAT", "filing": "Jun 30"}, "notes": "NHR regime for expats phased out for new applicants in 2024.", "quiz": [
        {"q": "Portugal VAT rate?", "opts": ["20%", "21%", "23%", "25%"], "correct": 2, "exp": "23% mainland."},
        {"q": "Portugal top personal tax rate?", "opts": ["40%", "45%", "48%", "52%"], "correct": 2, "exp": "48% top bracket."},
        {"q": "Portugal corporate tax rate?", "opts": ["19%", "21%", "23%", "25%"], "correct": 1, "exp": "21% standard CIT."},
    ]},
    {"key": "🇬🇷 Greece", "region": "Europe", "info": {"type": "Progressive", "personal": "9-44%", "corp": "22%", "consumption": "24% VAT", "filing": "Jun 30"}, "notes": "Non-dom tax regime offers flat €100k/year.", "quiz": [
        {"q": "Greece VAT rate?", "opts": ["19%", "21%", "24%", "27%"], "correct": 2, "exp": "24% standard."},
        {"q": "Greece corporate tax rate?", "opts": ["20%", "22%", "24%", "28%"], "correct": 1, "exp": "22% since 2022."},
        {"q": "Greece top personal tax rate?", "opts": ["38%", "42%", "44%", "48%"], "correct": 2, "exp": "44% top marginal."},
    ]},
    {"key": "🇮🇱 Israel", "region": "Middle East", "info": {"type": "Progressive", "personal": "10-50%", "corp": "23%", "consumption": "17% VAT", "filing": "Apr 30"}, "notes": "High-tech incentives lower CIT for qualifying activity.", "quiz": [
        {"q": "Israel VAT rate?", "opts": ["15%", "17%", "18%", "20%"], "correct": 1, "exp": "17% VAT."},
        {"q": "Israel corporate tax rate?", "opts": ["20%", "23%", "25%", "28%"], "correct": 1, "exp": "23% flat CIT."},
        {"q": "Israel top personal tax rate?", "opts": ["45%", "47%", "50%", "55%"], "correct": 2, "exp": "50% including surtax."},
    ]},
    {"key": "🇭🇰 Hong Kong", "region": "Asia", "info": {"type": "Progressive/Flat", "personal": "2-17%", "corp": "8.25-16.5%", "consumption": "None", "filing": "Jun 1"}, "notes": "Territorial system, no VAT/GST.", "quiz": [
        {"q": "Hong Kong consumption tax (VAT/GST)?", "opts": ["0%", "5%", "10%", "15%"], "correct": 0, "exp": "No sales tax / VAT / GST."},
        {"q": "Hong Kong corporate tax rate (profits > HK$2m)?", "opts": ["12.5%", "15%", "16.5%", "20%"], "correct": 2, "exp": "16.5% two-tier top rate."},
        {"q": "Hong Kong salaries tax standard rate?", "opts": ["10%", "15%", "17%", "20%"], "correct": 1, "exp": "15% standard rate cap."},
    ]},
    {"key": "🇻🇪 Venezuela", "region": "Americas", "info": {"type": "Progressive", "personal": "6-34%", "corp": "34%", "consumption": "16% IVA", "filing": "Mar 31"}, "notes": "Inflation adjustments frequent.", "quiz": [
        {"q": "Venezuela IVA (VAT) rate?", "opts": ["12%", "16%", "20%", "22%"], "correct": 1, "exp": "16% standard IVA."},
        {"q": "Venezuela top corporate tax?", "opts": ["25%", "30%", "34%", "40%"], "correct": 2, "exp": "34% top CIT bracket."},
        {"q": "Venezuela top personal tax rate?", "opts": ["25%", "30%", "34%", "40%"], "correct": 2, "exp": "34% top marginal."},
    ]},
]
