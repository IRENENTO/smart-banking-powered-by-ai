import random

def get_forecast():
    """
    Returns economic forecast data matching the EconomicForecast Pydantic schema:
      inflation_rate: float
      gdp_growth: float
      market_sentiment: str
      recommendations: list
    """
    sentiments = ["positive", "neutral", "cautious", "negative"]
    gdp = round(random.uniform(-1.0, 5.0), 2)
    inflation = round(random.uniform(1.5, 8.5), 2)
    sentiment = random.choice(sentiments)

    recs = []
    if inflation > 6.0:
        recs.append("High inflation detected — consider fixed-rate savings products.")
    if gdp < 1.0:
        recs.append("Slow growth environment — prioritize liquidity and emergency funds.")
    if sentiment in ("positive", "neutral"):
        recs.append("Market conditions are favorable for medium-term loan applications.")
    if gdp > 3.0:
        recs.append("Strong growth period — good time to consider investment products.")
    if not recs:
        recs.append("Maintain a diversified savings and investment portfolio.")
        recs.append("Monitor interest rate trends before committing to long-term loans.")

    return {
        "inflation_rate": inflation,
        "gdp_growth": gdp,
        "market_sentiment": sentiment,
        "recommendations": recs
    }
