"""
BharatIntel — FastAPI Intelligence Engine
main.py

Endpoints (mock layer — swap return values for real Cypher queries on Day 5):
  GET  /graph/subgraph
  GET  /graph/timeline
  POST /query
  POST /whatif
  GET  /alerts/patterns
  GET  /impact/{node_id}
  GET  /theory/equilibrium
  GET  /theory/shapley
  GET  /theory/balance-of-threat/{node_id}
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import math
from itertools import combinations
from math import factorial

# ── optional: pip install nashpy numpy ──────────────────────────────────────
try:
    import nashpy as nash
    import numpy as np
    NASHPY_AVAILABLE = True
except ImportError:
    NASHPY_AVAILABLE = False

app = FastAPI(title="BharatIntel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── mock data (mirrors src/data/mockdata.ts) ─────────────────────────────────

MOCK_NODES = {
    "Q668":   {"id": "Q668",    "name": "India",         "type": "country",          "lat": 20.59,  "lng": 78.96,  "impactScore": 100, "confidence": 1.0},
    "Q148":   {"id": "Q148",    "name": "China",         "type": "chokepoint",       "lat": 35.86,  "lng": 104.19, "impactScore": 91,  "confidence": 0.97},
    "Q843":   {"id": "Q843",    "name": "Pakistan",      "type": "buffer_state",     "lat": 30.37,  "lng": 69.34,  "impactScore": 87,  "confidence": 0.95},
    "Q837":   {"id": "Q837",    "name": "Nepal",         "type": "buffer_state",     "lat": 28.39,  "lng": 84.12,  "impactScore": 72,  "confidence": 0.93},
    "Q854":   {"id": "Q854",    "name": "Sri Lanka",     "type": "buffer_state",     "lat": 7.87,   "lng": 80.77,  "impactScore": 68,  "confidence": 0.91},
    "Q902":   {"id": "Q902",    "name": "Bangladesh",    "type": "buffer_state",     "lat": 23.68,  "lng": 90.35,  "impactScore": 61,  "confidence": 0.89},
    "Q836":   {"id": "Q836",    "name": "Myanmar",       "type": "buffer_state",     "lat": 21.91,  "lng": 95.95,  "impactScore": 58,  "confidence": 0.85},
    "Gwadar": {"id": "Gwadar",  "name": "Gwadar Port",  "type": "chokepoint",       "lat": 25.12,  "lng": 62.32,  "impactScore": 83,  "confidence": 0.88},
    "Malacca":{"id": "Malacca", "name": "Str. Malacca", "type": "chokepoint",       "lat": 2.18,   "lng": 102.25, "impactScore": 79,  "confidence": 0.92},
    "BRI":    {"id": "BRI",     "name": "Belt & Road",  "type": "string_of_pearls", "lat": 39.90,  "lng": 116.40, "impactScore": 77,  "confidence": 0.86},
    "RE":     {"id": "RE",      "name": "Rare Earths",  "type": "dependency",       "lat": 36.0,   "lng": 101.0,  "impactScore": 85,  "confidence": 0.91},
    "IL":     {"id": "IL",      "name": "Israel",        "type": "country",          "lat": 31.76,  "lng": 35.21,  "impactScore": 22,  "confidence": 0.80},
    "US":     {"id": "US",      "name": "USA",           "type": "country",          "lat": 37.09,  "lng": -95.71, "impactScore": 45,  "confidence": 0.88},
}

MOCK_EDGES = [
    {"id": "e1",  "source": "Q148", "target": "Gwadar",   "relation": "INVESTS_IN",   "confidence": 0.91, "conflictFlag": False, "validFrom": "2015-04-20"},
    {"id": "e2",  "source": "Q148", "target": "Q843",     "relation": "TRADES_WITH",  "confidence": 0.95, "conflictFlag": False, "validFrom": "2013-03-20"},
    {"id": "e3",  "source": "Q148", "target": "Q854",     "relation": "INVESTS_IN",   "confidence": 0.88, "conflictFlag": True,  "validFrom": "2017-07-01"},
    {"id": "e4",  "source": "Q148", "target": "Q837",     "relation": "TRADES_WITH",  "confidence": 0.82, "conflictFlag": False, "validFrom": "2016-05-10"},
    {"id": "e5",  "source": "Q148", "target": "BRI",      "relation": "LEADS",        "confidence": 0.97, "conflictFlag": False, "validFrom": "2013-09-07"},
    {"id": "e6",  "source": "Q148", "target": "RE",       "relation": "EXPORTS",      "confidence": 0.93, "conflictFlag": False, "validFrom": "2010-01-01"},
    {"id": "e7",  "source": "Q668", "target": "RE",       "relation": "DEPENDS_ON",   "confidence": 0.91, "conflictFlag": False, "validFrom": "2010-01-01"},
    {"id": "e8",  "source": "Q668", "target": "Q843",     "relation": "DISPUTE",      "confidence": 0.97, "conflictFlag": True,  "validFrom": "1947-08-14"},
    {"id": "e9",  "source": "Q668", "target": "Q148",     "relation": "DISPUTE",      "confidence": 0.95, "conflictFlag": True,  "validFrom": "1962-10-20"},
    {"id": "e10", "source": "Q668", "target": "Malacca",  "relation": "DEPENDS_ON",   "confidence": 0.89, "conflictFlag": False, "validFrom": "2000-01-01"},
    {"id": "e11", "source": "Q843", "target": "Gwadar",   "relation": "HOSTS",        "confidence": 0.94, "conflictFlag": False, "validFrom": "2015-04-20"},
]


# ── pydantic models ───────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str
    context_nodes: Optional[list[str]] = None

class WhatIfRequest(BaseModel):
    node_id: str
    simulate: str = "remove"   # "remove" | "isolate"


# ── helpers ───────────────────────────────────────────────────────────────────

def compute_impact_score(node_id: str) -> dict:
    """
    India Impact Score — weighted sum of graph properties.
    Weights (total 100):
      +25  buffer_state neighbour
      +25  chokepoint / BRI involvement
      +20  dependency vector
      +20  pattern match contribution
      +10  geographic proximity to India
    Replace internals with Cypher on Day 5.
    """
    node = MOCK_NODES.get(node_id)
    if not node:
        return {"score": 0, "breakdown": {}}

    breakdown = {
        "buffer_state":      0,
        "chokepoint_bri":    0,
        "dependency_vector": 0,
        "pattern_match":     0,
        "proximity":         0,
    }

    ntype = node["type"]

    # buffer state score
    if ntype == "buffer_state":
        breakdown["buffer_state"] = 25
    elif ntype in ("chokepoint", "string_of_pearls"):
        breakdown["chokepoint_bri"] = 25

    # dependency vector
    dep_edges = [e for e in MOCK_EDGES
                 if (e["source"] == node_id or e["target"] == node_id)
                 and e["relation"] in ("DEPENDS_ON", "EXPORTS")]
    breakdown["dependency_vector"] = min(20, len(dep_edges) * 8)

    # pattern match — count conflict edges touching this node
    conflict_edges = [e for e in MOCK_EDGES
                      if (e["source"] == node_id or e["target"] == node_id)
                      and e["conflictFlag"]]
    breakdown["pattern_match"] = min(20, len(conflict_edges) * 7)

    # proximity — use inverse distance from India
    india = MOCK_NODES["Q668"]
    lat_d = abs(node["lat"] - india["lat"])
    lng_d = abs(node["lng"] - india["lng"])
    dist  = math.sqrt(lat_d**2 + lng_d**2)
    breakdown["proximity"] = max(0, round(10 - dist * 0.06, 1))

    score = sum(breakdown.values())

    return {
        "node_id":   node_id,
        "node_name": node["name"],
        "score":     round(min(100, score), 1),
        "breakdown": breakdown,
        "label":     "CRITICAL" if score >= 70 else "HIGH" if score >= 40 else "WATCH",
    }


def shapley_values(players: list[str], coalition_value_fn) -> dict[str, float]:
    """
    Compute Shapley values for a coalition.
    coalition_value_fn: frozenset[str] -> float
    """
    n = len(players)
    values = {p: 0.0 for p in players}

    for player in players:
        others = [p for p in players if p != player]
        for r in range(len(others) + 1):
            for subset in combinations(others, r):
                s = list(subset)
                marginal = (
                    coalition_value_fn(frozenset(s + [player])) -
                    coalition_value_fn(frozenset(s))
                )
                weight = (factorial(len(s)) * factorial(n - len(s) - 1)) / factorial(n)
                values[player] += weight * marginal

    # normalise to sum to 1.0
    total = sum(values.values())
    if total > 0:
        values = {k: round(v / total, 4) for k, v in values.items()}

    return values


def balance_of_threat_score(node_id: str) -> dict:
    """
    Stephen Walt's Balance of Threat (1987).
    Threat = aggregate_power × proximity × offensive_capability × aggressive_intent
    Each component 0–1, final score 0–100.
    """
    node = MOCK_NODES.get(node_id)
    if not node:
        return {}

    india = MOCK_NODES["Q668"]

    # aggregate power — proxy: impactScore / 100
    agg_power = node["impactScore"] / 100

    # proximity — inverse normalised distance
    dist = math.sqrt(
        (node["lat"] - india["lat"])**2 +
        (node["lng"] - india["lng"])**2
    )
    proximity = max(0, 1 - dist / 180)

    # offensive capability — proxy: number of conflict edges
    conflict_count = sum(
        1 for e in MOCK_EDGES
        if (e["source"] == node_id or e["target"] == node_id) and e["conflictFlag"]
    )
    offensive = min(1.0, conflict_count * 0.25)

    # aggressive intent — proxy: average confidence on conflict edges
    conflict_edges = [e for e in MOCK_EDGES
                      if (e["source"] == node_id or e["target"] == node_id)
                      and e["conflictFlag"]]
    intent = (sum(e["confidence"] for e in conflict_edges) / len(conflict_edges)
              if conflict_edges else 0.0)

    threat = agg_power * proximity * offensive * intent
    score  = round(threat * 100, 1)

    return {
        "node_id":             node_id,
        "node_name":           node["name"],
        "threat_score":        score,
        "components": {
            "aggregate_power":      round(agg_power, 3),
            "proximity":            round(proximity, 3),
            "offensive_capability": round(offensive, 3),
            "aggressive_intent":    round(intent, 3),
        },
        "interpretation": (
            "Primary threat actor — balance immediately" if score >= 15 else
            "Significant threat — monitor closely"       if score >= 8  else
            "Moderate threat — standard monitoring"      if score >= 3  else
            "Low threat"
        ),
        "theory": "Walt (1987) Balance of Threat",
    }


# ── routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "BharatIntel API online", "version": "1.0.0"}


@app.get("/graph/subgraph")
def get_subgraph(
    center_node: str = Query("Q668", description="Node ID to centre on"),
    depth: int = Query(2, description="Graph traversal depth"),
):
    """
    Returns nodes + edges for the main graph view.
    TODO Day 5: replace with Neo4j Cypher
      MATCH (n)-[r*1..{depth}]-(m) WHERE n.id = '{center_node}' RETURN n, r, m
    """
    relevant_edges = [
        e for e in MOCK_EDGES
        if e["source"] == center_node or e["target"] == center_node
    ]
    node_ids = {center_node}
    for e in relevant_edges:
        node_ids.add(e["source"])
        node_ids.add(e["target"])

    return {
        "nodes": [MOCK_NODES[nid] for nid in node_ids if nid in MOCK_NODES],
        "edges": relevant_edges,
        "center": center_node,
        "depth":  depth,
    }


@app.get("/graph/timeline")
def get_timeline(
    node1: str = Query(...),
    node2: str = Query(...),
    date_from: str = Query("2010-01-01"),
    date_to:   str = Query("2026-01-01"),
):
    """
    Returns all edges between node1 and node2 filtered by date range.
    Powers the Time Machine slider.
    TODO Day 5: replace with Cypher valid_from / valid_to range query
    """
    edges = [
        e for e in MOCK_EDGES
        if (e["source"] in (node1, node2) and e["target"] in (node1, node2))
        and e["validFrom"] >= date_from
        and e["validFrom"] <= date_to
    ]
    return {
        "node1":     node1,
        "node2":     node2,
        "date_from": date_from,
        "date_to":   date_to,
        "edges":     edges,
        "count":     len(edges),
    }


@app.post("/query")
def post_query(body: QueryRequest):
    """
    Natural language query → GraphRAG answer.
    TODO Day 5: wire to Text2CypherRetriever + Ollama
      1. neo4j_graphrag.Text2CypherRetriever generates Cypher
      2. Run Cypher, get subgraph
      3. Send subgraph + question to Ollama
      4. Return answer + used_edges + confidence
    """
    q = body.question.lower()

    # mock response routing
    if "rare earth" in q or "leverage" in q:
        answer = ("India imports 72% of rare earth elements from China (conf 0.91 · 6 sources). "
                  "In 3 of 4 LAC escalation events since 2017, export delays followed within 18 days. "
                  "Graph path: India DEPENDS_ON → RareEarthImports → China.")
        used_edges = ["e7", "e6"]
        used_nodes = ["Q668", "RE", "Q148"]

    elif "treaty" in q or "overlap" in q or "neighbor" in q:
        answer = ("Bangladesh (BIMSTEC + SCO observer), Sri Lanka (VSC port + SAARC), Myanmar "
                  "(border security + BRI debt). All three have dual allegiance structures.")
        used_edges = ["e3", "e4"]
        used_nodes = ["Q668", "Q148", "Q854", "Q902", "Q836"]

    elif "balakot" in q or "pakistan" in q or "media" in q:
        answer = ("Media tone (Goldstein) deteriorated from avg -1.2 (2020) to -3.8 (2024). "
                  "India-Bangladesh improved +2.1 → +3.8. Polarization increasing.")
        used_edges = ["e8"]
        used_nodes = ["Q668", "Q843"]

    elif "string of pearls" in q:
        answer = ("3 of 4 pattern steps matched. Gwadar (Pakistan), Hambantota (Sri Lanka) confirmed. "
                  "Myanmar port access pending. Pattern confidence: 87%.")
        used_edges = ["e1", "e3", "e11"]
        used_nodes = ["Q148", "Q843", "Q854", "Gwadar"]

    else:
        answer = ("Query received. No high-confidence match in current graph. "
                  "Try: 'China leverage', 'treaty overlap', 'media tone Balakot', 'string of pearls'.")
        used_edges = []
        used_nodes = []

    evidence = [
        {"source": "gdelt.org",     "url": "https://gdelt.org/events/2024",  "tone": -1.4, "lang": "en"},
        {"source": "thehindu.com",  "url": "https://thehindu.com/article/1",  "tone": -0.8, "lang": "en"},
        {"source": "dawn.com",      "url": "https://dawn.com/article/1",      "tone": -2.1, "lang": "en"},
        {"source": "cfr.org",       "url": "https://cfr.org/analysis/1",      "tone":  0.3, "lang": "en"},
    ]

    return {
        "question":   body.question,
        "answer":     answer,
        "used_edges": used_edges,
        "used_nodes": used_nodes,
        "confidence": 0.84,
        "evidence":   evidence[:len(used_edges) + 1],
        "cypher_used": f"MATCH (n)-[r]->(m) WHERE n.id IN {used_nodes} RETURN n, r, m",
    }


@app.post("/whatif")
def post_whatif(body: WhatIfRequest):
    """
    Simulates removing a node and returns India Impact Score delta.
    TODO Day 5: run real Cypher path queries before + after removal
    """
    node = MOCK_NODES.get(body.node_id)
    if not node:
        raise HTTPException(status_code=404, detail=f"Node {body.node_id} not found")

    original = compute_impact_score("Q668")

    # find edges that would be removed
    affected_edges = [
        e for e in MOCK_EDGES
        if e["source"] == body.node_id or e["target"] == body.node_id
    ]

    # recompute impact without affected edges (simplified)
    conflict_reduction = sum(1 for e in affected_edges if e["conflictFlag"]) * 7
    dep_reduction      = sum(1 for e in affected_edges if e["relation"] == "DEPENDS_ON") * 8

    simulated_score = max(0, original["score"] - conflict_reduction - dep_reduction)
    delta           = round(simulated_score - original["score"], 1)

    return {
        "node_id":        body.node_id,
        "node_name":      node["name"],
        "simulate":       body.simulate,
        "original_score": original["score"],
        "simulated_score": round(simulated_score, 1),
        "delta":          delta,
        "delta_label":    "REDUCED" if delta < 0 else "INCREASED" if delta > 0 else "UNCHANGED",
        "affected_edges": [e["id"] for e in affected_edges],
        "interpretation": (
            f"Removing {node['name']} reduces India threat exposure by {abs(delta)} points. "
            f"{len(affected_edges)} edges collapse."
            if delta < 0 else
            f"Removing {node['name']} has minimal impact on India exposure."
        ),
    }


@app.get("/alerts/patterns")
def get_alert_patterns():
    """
    Returns all currently matched escalation patterns.
    TODO Day 5: run 3 Cypher path templates against live graph
    """
    return {
        "patterns": [
            {
                "id":           "string_of_pearls",
                "name":         "String of Pearls",
                "threat_level": "CRITICAL",
                "confidence":   0.87,
                "steps_matched": 3,
                "steps_total":   4,
                "nodes_involved": ["Q148", "Q843", "Q854", "Gwadar"],
                "last_step":     "CHN → Gwadar port investment confirmed",
                "missing_step":  "Myanmar naval access — pending",
                "recommendation": "Monitor Myanmar port negotiations. 4th step = full encirclement.",
            },
            {
                "id":           "debt_trap",
                "name":         "Debt Trap",
                "threat_level": "CRITICAL",
                "confidence":   0.92,
                "steps_matched": 3,
                "steps_total":   3,
                "nodes_involved": ["Q148", "Q854", "Gwadar"],
                "last_step":     "Hambantota lease confirmed — 99yr",
                "missing_step":  None,
                "recommendation": "Pattern complete. PLA-N docking rights active.",
            },
            {
                "id":           "buffer_erosion",
                "name":         "Buffer State Erosion",
                "threat_level": "HIGH",
                "confidence":   0.78,
                "steps_matched": 2,
                "steps_total":   3,
                "nodes_involved": ["Q148", "Q837", "Q668"],
                "last_step":     "Nepal BRI accession signal",
                "missing_step":  "Formal infrastructure contract",
                "recommendation": "Nepal northern buffer arc at risk. BRI entrenchment collapses 3 edges.",
            },
        ],
        "total":    3,
        "critical": 2,
        "high":     1,
        "generated_at": "2026-03-21T22:00:00Z",
    }


@app.get("/impact/{node_id}")
def get_impact(node_id: str):
    """
    Returns India Impact Score with full breakdown for a node.
    """
    if node_id not in MOCK_NODES:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
    return compute_impact_score(node_id)


# ── game theory endpoints ─────────────────────────────────────────────────────

@app.get("/theory/equilibrium")
def get_equilibrium(
    node1: str = Query("Q668", description="First actor node ID"),
    node2: str = Query("Q148", description="Second actor node ID"),
):
    """
    Computes Nash Equilibrium for the bilateral relationship between node1 and node2.
    Payoff matrix derived from graph edge properties.
    Uses nashpy if available, otherwise analytical fallback.
    """
    n1 = MOCK_NODES.get(node1)
    n2 = MOCK_NODES.get(node2)
    if not n1 or not n2:
        raise HTTPException(status_code=404, detail="One or both nodes not found")

    # derive payoffs from graph
    edges_between = [
        e for e in MOCK_EDGES
        if (e["source"] == node1 and e["target"] == node2) or
           (e["source"] == node2 and e["target"] == node1)
    ]
    conflict_count = sum(1 for e in edges_between if e["conflictFlag"])
    avg_conf       = (sum(e["confidence"] for e in edges_between) / len(edges_between)
                      if edges_between else 0.5)

    # payoff matrix construction
    # (cooperate, cooperate), (cooperate, defect), (defect, cooperate), (defect, defect)
    base = avg_conf * 4
    A = [[base,       -1],
         [base + 2,    0]]
    B = [[base,    base + 2],
         [-1,           0]]

    if NASHPY_AVAILABLE:
        game  = nash.Game(np.array(A), np.array(B))
        equilibria = list(game.support_enumeration())
        eq_readable = []
        for eq in equilibria:
            s1 = "cooperate" if eq[0][0] > 0.5 else "defect"
            s2 = "cooperate" if eq[1][0] > 0.5 else "defect"
            eq_readable.append({"node1_strategy": s1, "node2_strategy": s2})
    else:
        # analytical fallback — if conflict edges dominate, defect is dominant
        if conflict_count > len(edges_between) / 2:
            eq_readable = [{"node1_strategy": "defect", "node2_strategy": "defect"}]
        else:
            eq_readable = [{"node1_strategy": "cooperate", "node2_strategy": "cooperate"}]

    stability = round(1 - conflict_count / max(len(edges_between), 1), 2)

    return {
        "node1":        node1,
        "node2":        node2,
        "node1_name":   n1["name"],
        "node2_name":   n2["name"],
        "equilibria":   eq_readable,
        "stability":    stability,
        "payoff_matrix": {"A": A, "B": B},
        "edges_analysed": len(edges_between),
        "conflict_edges": conflict_count,
        "interpretation": (
            f"{n1['name']} and {n2['name']} are in a {'stable cooperative' if stability > 0.6 else 'unstable'} equilibrium. "
            f"{'Neither actor benefits from changing strategy.' if stability > 0.6 else 'Both actors have incentive to defect.'}"
        ),
        "theory": "Nash (1950) Non-Cooperative Game Theory",
        "nashpy_used": NASHPY_AVAILABLE,
    }


@app.get("/theory/shapley")
def get_shapley(
    coalition: str = Query("Q668,US,Q175,Q664", description="Comma-separated node IDs"),
    target: str    = Query("Q668", description="Node to protect — India by default"),
):
    """
    Computes Shapley values for a security coalition.
    Answers: how much does each ally contribute to India's security?
    """
    members = [m.strip() for m in coalition.split(",")]
    members = [m for m in members if m in MOCK_NODES]

    if len(members) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 valid node IDs in coalition")

    def coalition_value(subset: frozenset) -> float:
        """
        Value of a coalition = sum of edges to target node from coalition members,
        weighted by confidence and penalised by conflict flags.
        """
        val = 0.0
        for e in MOCK_EDGES:
            if e["source"] in subset and e["target"] == target:
                val += e["confidence"] * (0.5 if e["conflictFlag"] else 1.0)
            if e["target"] in subset and e["source"] == target:
                val += e["confidence"] * 0.3
        return val

    values = shapley_values(members, coalition_value)

    return {
        "coalition":     members,
        "target":        target,
        "target_name":   MOCK_NODES[target]["name"],
        "shapley_values": [
            {
                "node_id":     m,
                "node_name":   MOCK_NODES[m]["name"],
                "value":       values.get(m, 0),
                "contribution_pct": round(values.get(m, 0) * 100, 1),
            }
            for m in sorted(members, key=lambda x: values.get(x, 0), reverse=True)
        ],
        "interpretation": (
            f"In this coalition, {MOCK_NODES[max(values, key=values.get)]['name']} "
            f"contributes the most to {MOCK_NODES[target]['name']}'s security "
            f"({round(max(values.values()) * 100, 1)}% marginal value)."
        ),
        "theory": "Shapley (1953) Cooperative Game Theory",
    }


@app.get("/theory/balance-of-threat/{node_id}")
def get_balance_of_threat(node_id: str):
    """
    Stephen Walt (1987) Balance of Threat score for a given node
    as perceived by India.
    Components: aggregate_power × proximity × offensive_capability × aggressive_intent
    """
    if node_id not in MOCK_NODES:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
    return balance_of_threat_score(node_id)


@app.get("/theory/balance-of-threat")
def get_all_threat_scores():
    """Returns Balance of Threat scores for all nodes, sorted by threat."""
    scores = [balance_of_threat_score(nid) for nid in MOCK_NODES if nid != "Q668"]
    scores.sort(key=lambda x: x["threat_score"], reverse=True)
    return {"scores": scores, "theory": "Walt (1987) Balance of Threat"}
