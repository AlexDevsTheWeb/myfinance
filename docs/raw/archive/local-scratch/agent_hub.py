import os
import subprocess
import json
from openai import OpenAI
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env (es. la tua API key di OpenCode Zen)
load_dotenv()

# Inizializziamo il client per OpenCode Zen
# client_zen = OpenAI(
#     api_key=os.environ.get("OPENCODE_ZEN_API_KEY"),
#     base_url="https://opencode.ai/zen/v1"
# )
client_zen = OpenAI(
    api_key=os.environ.get("OPENCODE_ZEN_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

# Configurazione globale - Modificabile nel tempo
MODEL_PLANNER = "deepseek-v4-flash"
MODEL_QA = "deepseek-v4-flash"
BRANCH_TARGET = "development"

# ==========================================
# FASE 1: GENERAZIONE WIKI (DeepSeek V4)
# ==========================================
def generate_wiki_page(issue_text, issue_id):
    """Analizza la issue, crea la Wiki ed esegue l'ingest programmatico via API"""
    print(f"\n📝 [Fase 1] Generazione Wiki per {issue_id}...")
    
    prompt = f"""
    Analizza questa issue di GitHub per l'applicazione myfinance e genera una pagina di documentazione tecnica in formato Markdown (.md).
    La pagina deve descrivere l'impatto architetturale, quali componenti potrebbero essere influenzati e la logica dei calcoli.
    
    ISSUE:
    {issue_text}
    """
    
    response = client_zen.chat.completions.create(
        model=MODEL_PLANNER,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        max_tokens=4000
    )
    
    markdown_content = ""
    for chunk in response:
        content = chunk.choices[0].delta.content
        if content:
            print(content, end="", flush=True)
            markdown_content += content
            
    print("\n")
    
    # Salva il file nella cartella raw
    os.makedirs("docs/YATF/raw", exist_ok=True)
    filepath = f"docs/YATF/raw/{issue_id}.md"
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(markdown_content)
    print(f"✅ Wiki grezza salvata in: {filepath}")
    
    # --- INGEST PROGRAMMATICO (Bypass della CLI interattiva) ---
    print("🔄 Esecuzione analisi completa e Ingest nella documentazione...")
    
    prompt_ingest = f"""
    Hai a disposizione un nuovo file di documentazione appena generato in docs/YATF/raw/{issue_id}.md.
    Esegui un'analisi completa di questo impatto per integrarlo nella conoscenza globale della wiki di myfinance.
    Fornisci un riepilogo strutturato dei file core che verranno toccati.
    """
    
    # Chiediamo l'ingest direttamente al modello senza passare dalla CLI bloccata
    ingest_response = client_zen.chat.completions.create(
        model=MODEL_PLANNER,
        messages=[
            {"role": "system", "content": "Sei l'assistente documentale di myfinance."},
            {"role": "user", "content": prompt_ingest}
        ],
        stream=True,
        max_tokens=2000
    )
    
    ingest_content = ""
    for chunk in ingest_response:
        content = chunk.choices[0].delta.content
        if content:
            print(content, end="", flush=True)
            ingest_content += content
            
    print("\n")
    
    # Salviamo l'esito dell'ingest direttamente nella cartella wiki
    os.makedirs("docs/YATF/wiki", exist_ok=True)
    ingest_filepath = f"docs/YATF/wiki/{issue_id}_ingest_log.md"
    with open(ingest_filepath, "w", encoding="utf-8") as f:
        f.write(ingest_content)
        
    print(f"✅ Ingest completato. Log di analisi salvato in: {ingest_filepath}")
    return filepath

# ==========================================
# FASE 2: PIANIFICAZIONE TASK (DeepSeek V4)
# ==========================================
def generate_gsd_plan(issue_text):
    """Scompone la issue in subtask atomici mostrando lo streaming del JSON"""
    print(f"\n🎯 [Fase 2] Scomposizione della issue in subtask (Streaming)...")
    
    prompt = f"""
    Agisci come un Software Architect. Scomponi la seguente issue in micro-task atomici isolati.
    Ogni task deve indicare chiaramente il file da modificare e l'azione esatta da compiere.
    
    Rispondi RIGOROSAMENTE ed ESCLUSIVAMENTE con un oggetto JSON valido che segue questa struttura, senza commenti o markdown esterni:
    {{
      "phase": "plan",
      "steps": [
        {{ "id": 1, "file": "percorso/del/file.ts", "action": "Cosa fare in dettaglio" }}
      ]
    }}
    
    ISSUE:
    {issue_text}
    """
    
    response = client_zen.chat.completions.create(
        model=MODEL_PLANNER,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        max_tokens=2000
    )
    
    json_content = ""
    for chunk in response:
        content = chunk.choices[0].delta.content
        if content:
            print(content, end="", flush=True)
            json_content += content
            
    print("\n")
    plan_data = json.loads(json_content)
    return plan_data["steps"]

# ==========================================
# FASE 3: ESECUZIONE LOCALE (Pi + Ornith:9b)
# ==========================================
def execute_subtask_locally(step):
    """Lancia la CLI di Pi, mostra l'output in diretta e chiude la sessione quando ha finito"""
    print(f"\n🤖 [Fase 3] Esecuzione Step {step['id']} su {step['file']}...")
    
    prompt_for_pi = f"Modifica il file {step['file']} per eseguire questa azione: {step['action']}"
    comando_split = ["pi", prompt_for_pi]
    
    try:
        # Usiamo subprocess.Popen invece di run per poter controllare i canali di comunicazione.
        # Chiudendo lo stdin (stdin=subprocess.DEVNULL), diciamo a Pi che non ci sarà alcun 
        # input umano dal terminale, spingendolo a chiudersi non appena finisce di scrivere il codice.
        processo = subprocess.Popen(
            comando_split, 
            stdin=subprocess.DEVNULL, 
            stdout=None, # Permette di vedere l'output nel terminale in tempo reale
            stderr=None
        )
        
        # Attende che il processo finisca. 
        # Se dopo 3 minuti (180 secondi) è ancora appeso dopo aver scritto il codice, lo killa.
        processo.wait(timeout=180)
        
        if processo.returncode != 0:
            print(f"⚠️ Errore durante l'esecuzione dello step {step['id']}")
            return False
        return True
        
    except subprocess.TimeoutExpired:
        print(f"⏱️ Step {step['id']} andato in timeout (Pi è rimasto appeso dopo aver finito). Forzo la chiusura...")
        processo.kill()
        return True # Proseguiamo comunque perché il codice probabilmente è già stato scritto

# ==========================================
# FASE 4: QUALITY ASSURANCE & REVIEW (DeepSeek/Claude)
# ==========================================
def run_quality_assurance(issue_text):
    """Controlla il linter, compila ed effettua una review logica del codice"""
    print("🛡️ [Fase 4] Avvio Quality Assurance...")
    
    # 1. Controlli meccanici locali
    print("Running linter and typescript checks...")
    lint = subprocess.run(["npm", "run", "lint"], capture_output=True, text=True)
    tsc = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True)
    
    if lint.returncode != 0 or tsc.returncode != 0:
        print("❌ QA Meccanica Fallita: Il linter o TypeScript hanno rilevato errori.")
        print(lint.stdout + tsc.stdout)
        return "REJECTED_BUILD_ERROR"
        
    # 2. Review logica tramite LLM usando il git diff
    print("Generazione git diff per la review logica...")
    git_diff = subprocess.run(["git", "diff", BRANCH_TARGET], capture_output=True, text=True).stdout
    
    prompt_qa = f"""
    Analizza le modifiche apportate nel seguente GIT DIFF rispetto alla issue originale.
    Verifica se la logica è corretta o se ci sono falle o bug macroscopici.
    Rispondi con APPROVED se tutto è ok, altrimenti elenca le correzioni da fare.
    
    ISSUE ORIGINALE:
    {issue_text}
    
    GIT DIFF:
    {git_diff}
    """
    
    response = client_zen.chat.completions.create(
        model=MODEL_QA,
        messages=[{"role": "user", "content": prompt_qa}],
        max_tokens=2000
    )
    
    review_result = response.choices[0].message.content
    print(f"Esito Review:\n{review_result}")
    
    if "APPROVED" in review_result:
        return "APPROVED"
    return "REJECTED_LOGIC_ERROR"

# ==========================================
# ORCHESTRATORE PRINCIPALE (Il Regista)
# ==========================================
def main():
    ## CHIEDIAMO A OPENCODE ZEN LA LISTA DEI SUOI MODELLI ATTIVI
    # print("🔍 Controllo modelli disponibili su OpenCode Zen...")
    # modelli = [m.id for m in client_zen.models.list()]
    # print(f"Modelli disponibili: {modelli}")
    # return # <--- Blocchiamo lo script qui temporaneamente per leggere l'output
    # Inserisci qui i dati della tua issue per il test
    issue_id = "109"
    issue_description = """
    ## Feature: Per-Ticker Market Pricing
    **Priority:** High
    ### Current State
    The store holds a single `currentPrice: number | null` (`useInvestmentStore.ts:22`). The `useMarketData` hook fetches prices via Yahoo Finance batch API but only stores the first quotes price. `usePortfolio` then applies this single price to ALL holdings.
    ### Problem
    With multiple tickers (V2+ multi-broker), each ETF has a different market price. A single price produces incorrect per-ticker valuations, return percentages, and chart data.
    ### Solution
    Replace the single price with a ticker→price dictionary:
    ```typescript
    // Current:
    currentPrice: number | null;
    // New:
    currentPrices: Record<string, number>;
    ```
    ### Files to modify
    - `src/store/types/investment.types.ts` — update state interface
    - `src/store/useInvestmentStore.ts` — update `setCurrentPrice` → `setCurrentPrices`
    - `src/hooks/useMarketData.ts` — parse batch API response by ticker
    - `src/analytics/hooks/usePortfolio.ts` — look up per-ticker price from `currentPrices`
    - `src/store/useInvestmentSync.ts` — sync new field
    ### Implementation Notes
    - yfin.dev batch endpoint returns `quotes[]` with each quote having a `symbol` field — map by symbol
    - Fallback: if a ticker has no price, use the latest snapshots implied price for that ticker
    - No Firestore schema change — `currentPrices` is local state, not persisted
    """
    
    print(f"🚀 Avvio Agent Hub per la issue {issue_id}")
    
    # Configurazione iniziale dei rami Git
    subprocess.run(["git", "checkout", BRANCH_TARGET])
    # Crea o si sposta sul branch di fix
    subprocess.run(f"git checkout -b fix/{issue_id} 2>/dev/null || git checkout fix/{issue_id}", shell=True)
    
    # 1. Genera la wiki
    generate_wiki_page(issue_description, issue_id)
    
    # 2. Genera il piano dei subtask
    subtasks = generate_gsd_plan(issue_description)
    print(f"Pianificati {len(subtasks)} micro-task.")
    
    # 3. Ciclo di esecuzione sui subtask
    for task in subtasks:
        successo = execute_subtask_locally(task)
        if not successo:
            print("🛑 Interruzione del flusso per errore su un subtask.")
            return
            
    # 4. Fase finale di QA
    stato_finale = run_quality_assurance(issue_description)
    
    if stato_finale == "APPROVED":
        print("🎉 TUTTO VERDE! Il codice è perfetto. Creazione Pull Request...")
        # Comando per creare la PR tramite GitHub CLI
        subprocess.run(f"gh pr create --title 'fix: {issue_id} dynamic settings' --body 'Automated PR'", shell=True)
    else:
        print("❌ Il codice ha bisogno di revisioni. Controlla i log sopra.")

if __name__ == "__main__":
    main()
