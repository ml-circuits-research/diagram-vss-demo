# Front-end thresholds chosen on held-out training messages

fit 947 messages, dev 253 messages (1126 requests, 313 chatter sentences).
Score = dev requests made fully readable - chatter sentences where a trigger fires. Chosen: {"seg_epochs": 8, "val_min_count": 5, "val_min_prec": 0.8, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}

| parameter | value | readable | false triggers | score |
|---|---|---|---|---|
| val_min_count | 2 | 877 | 57 | 820 |
| val_min_count | 3 | 880 | 55 | 825 |
| val_min_count | 5 | 880 | 55 | 825 |
| val_min_prec | 0.6 | 865 | 55 | 810 |
| val_min_prec | 0.7 | 880 | 55 | 825 |
| val_min_prec | 0.8 | 883 | 55 | 828 |
| val_min_prec | 0.9 | 879 | 59 | 820 |
| trig_min_count | 2 | 883 | 55 | 828 |
| trig_min_count | 3 | 872 | 55 | 817 |
| trig_min_count | 5 | 852 | 51 | 801 |
| trig_share | 0.6 | 882 | 55 | 827 |
| trig_share | 0.75 | 883 | 55 | 828 |
| trig_share | 0.9 | 881 | 55 | 826 |
| trig_min_prec | 0.5 | 891 | 70 | 821 |
| trig_min_prec | 0.6 | 883 | 55 | 828 |
| trig_min_prec | 0.7 | 863 | 52 | 811 |
| trig_min_prec | 0.8 | 861 | 51 | 810 |
| seg_epochs | 3 | span F1 0.911 | | |
| seg_epochs | 5 | span F1 0.910 | | |
| seg_epochs | 8 | span F1 0.913 | | |
