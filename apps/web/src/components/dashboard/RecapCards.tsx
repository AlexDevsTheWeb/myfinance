import { Box, Grid, LinearProgress, Paper, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { CreditCard, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useFinanceStore } from "../../store/useFinanceStore";

interface RecapCardsProps {
    onOpenAccountDialog?: () => void;
}

const RecapCards: React.FC<RecapCardsProps> = ({
    onOpenAccountDialog,
}) => {
    const { t } = useTranslation();
    const { transactions, accounts, cards, balanceStartDate } = useFinanceStore();

    const accountsDetail = React.useMemo(() => {
        const startDateStr = dayjs(balanceStartDate).format("YYYY-MM-DD");

        return accounts.map((acc) => {
            const periodTransactions = transactions
                .filter((t) => t.accountId === acc.id && dayjs(t.date).format("YYYY-MM-DD") >= startDateStr)
                .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

            const income = periodTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
            const expense = periodTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

            let runningBalance = acc.initialBalance;
            const history = [
                { date: startDateStr, amount: runningBalance },
                ...periodTransactions.map((t) => {
                    runningBalance += t.type === "income" ? t.amount : -t.amount;
                    return { date: t.date, amount: runningBalance };
                }),
            ];

            return {
                ...acc,
                currentBalance: acc.initialBalance + income - expense,
                periodIncome: income,
                periodExpense: expense,
                history,
            };
        });
    }, [transactions, accounts, balanceStartDate]);

    const totalIncome = accountsDetail.reduce((sum, acc) => sum + acc.periodIncome, 0);
    const totalExpenses = accountsDetail.reduce((sum, acc) => sum + acc.periodExpense, 0);
    const currentBalance = accountsDetail.reduce((sum, acc) => sum + acc.currentBalance, 0);

    const monthlyStats = React.useMemo(() => {
        const monthlyTransactions = transactions.filter((t) => dayjs(t.date).isSame(dayjs(), "month"));

        const income = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const expense = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
        const delta = income - expense;

        return { income, expense, delta };
    }, [transactions]);

    const cardData = [
        {
            id: "currentBalance",
            title: t("dashboard.currentBalance"),
            amount: currentBalance,
            icon: <Wallet size={24} />,
            color: 'primary.main',
        },
        {
            id: "totalIncome",
            title: t("dashboard.totalIncome"),
            amount: totalIncome,
            icon: <TrendingUp size={24} />,
            color: 'success.main',
        },
        {
            id: "totalExpenses",
            title: t("dashboard.totalExpenses"),
            amount: totalExpenses,
            icon: <TrendingDown size={24} />,
            color: 'error.main',
        },
    ];

    const monthlyCardData = [
        {
            id: "incomeMonth",
            title: t("dashboard.incomeMonth"),
            amount: monthlyStats.income,
            color: 'success.main',
        },
        {
            id: "expensesMonth",
            title: t("dashboard.expensesMonth"),
            amount: monthlyStats.expense,
            color: 'error.main',
        },
        {
            id: "netDeltaMonth",
            title: t("dashboard.netDeltaMonth"),
            amount: monthlyStats.delta,
            color: monthlyStats.delta >= 0 ? 'success.main' : 'error.main',
        },
    ];

    const cardUtilization = React.useMemo(() => {
        return cards.map(card => {
            const resetDay = card.billingDay;
            const now = dayjs();
            let periodStart: dayjs.Dayjs;
            let periodEnd: dayjs.Dayjs;

            if (now.date() >= resetDay) {
                periodStart = now.date(resetDay).startOf('day');
                periodEnd = now.add(1, 'month').date(resetDay).startOf('day');
            } else {
                periodStart = now.subtract(1, 'month').date(resetDay).startOf('day');
                periodEnd = now.date(resetDay).startOf('day');
            }

            const spent = transactions
                .filter(t =>
                    t.type === 'expense' &&
                    t.cardId === card.id &&
                    dayjs(t.date).valueOf() >= periodStart.valueOf() &&
                    dayjs(t.date).valueOf() < periodEnd.valueOf()
                )
                .reduce((sum, t) => sum + t.amount, 0);

            const available = card.plafond - spent;
            const usagePercent = card.plafond > 0 ? Math.min(spent / card.plafond, 1) : 0;

            return { card, spent, available, usagePercent };
        });
    }, [cards, transactions]);

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={1.5}>
                    {cardData.map((card) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.title}>
                            <Paper
                                onClick={() => card.id === "currentBalance" && onOpenAccountDialog?.()}
                                sx={{
                                    p: 1.5,
                                    bgcolor: 'background.paper',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    cursor: card.id === "currentBalance" ? "pointer" : "default",
                                }}
                            >
                                <Box sx={{ p: 1, background: card.color, color: "#fff", display: "flex" }}>{card.icon}</Box>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: card.color, opacity: 0.9, textTransform: "uppercase", fontWeight: 700, fontSize: "0.65rem" }}
                                    >
                                        {card.title}
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                                            lineHeight: 1.2,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            maxWidth: "100%",
                                        }}
                                    >
                                        € {card.amount.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}

                    {monthlyCardData.map((card) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.title}>
                            <Paper
                                sx={{
                                    p: 1.5,
                                    bgcolor: 'background.paper',
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700, textTransform: "uppercase", fontSize: "0.6rem", mb: 0.5 }}>
                                    {card.title}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: card.color,
                                        fontWeight: 800,
                                        fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                                        lineHeight: 1.2,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: "100%",
                                    }}
                                >
                                    € {card.amount.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Grid>

            {cardUtilization.length > 0 && (
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <CreditCard size={18} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.7 }}>
                                Card Utilization
                            </Typography>
                        </Box>
                        {cardUtilization.map(({ card, spent, available, usagePercent }) => (
                            <Box key={card.id} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{card.name}</Typography>
                                        <Typography variant="caption" sx={{
                                            bgcolor: card.type === 'credit' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                            color: card.type === 'credit' ? '#818cf8' : '#34d399',
                                            px: 0.6, borderRadius: 0.5, fontSize: '0.55rem', fontWeight: 700
                                        }}>
                                            {card.type.toUpperCase()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                        €{spent.toLocaleString('it-IT', { minimumFractionDigits: 0 })} / €{card.plafond.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
                                    </Typography>
                                </Box>
                                <Tooltip title={`${(usagePercent * 100).toFixed(0)}% used · €${available.toLocaleString('it-IT', { minimumFractionDigits: 0 })} available`}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={usagePercent * 100}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: usagePercent > 0.8 ? 'error.main' : usagePercent > 0.5 ? 'warning.main' : 'success.main',
                                                borderRadius: 4,
                                            },
                                        }}
                                    />
                                </Tooltip>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            )}

        </Grid>
    );
};

export default RecapCards;
