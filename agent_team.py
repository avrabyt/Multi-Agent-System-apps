# Refer to : https://docs.phidata.com/agents/teams
# While prompting in Databutton : Pass this above url


from fastapi import APIRouter
from pydantic import BaseModel
from phi.agent import Agent
from phi.tools.hackernews import HackerNews
from phi.tools.duckduckgo import DuckDuckGo
from phi.tools.newspaper4k import Newspaper4k
import databutton as db
import os

# Set OpenAI API key from Databutton secrets
os.environ["OPENAI_API_KEY"] = db.secrets.get("OPENAI_API_KEY")

router = APIRouter()

class AgentTeamRequest(BaseModel):
    query: str
    max_stories: int = 2  # Default to 2 stories for reasonable response times

class AgentTeamResponse(BaseModel):
    summary: str
    sources: list[str]  # URLs of sources used

# Initialize individual agents
hn_researcher = Agent(
    name="HackerNews Researcher",
    role="Gets top stories from hackernews.",
    tools=[HackerNews()],
)

web_searcher = Agent(
    name="Web Searcher",
    role="Searches the web for information on a topic",
    tools=[DuckDuckGo()],
    add_datetime_to_instructions=True,
)

article_reader = Agent(
    name="Article Reader",
    role="Reads articles from URLs.",
    tools=[Newspaper4k()],
)

# Create the agent team
research_team = Agent(
    name="Research Team",
    team=[hn_researcher, web_searcher, article_reader],
    instructions=[
        "First, search hackernews for what the user is asking about.",
        "Then, ask the article reader to read the links for the stories to get more information.",
        "Important: you must provide the article reader with the links to read.",
        "Then, ask the web searcher to search for each story to get more information.",
        "Finally, provide a thoughtful and engaging summary.",
    ],
    show_tool_calls=False,
    markdown=True,
)

@router.post("/research")
def run_research_team(request: AgentTeamRequest) -> AgentTeamResponse:
    """
    Run the research team to analyze HackerNews stories and provide a summary

    Args:
        request: Contains the query and max number of stories to analyze

    Returns:
        A summary of the findings and list of sources used
    """
    # Format the query to include the max stories limit
    query = f"Write an article about the top {request.max_stories} stories on hackernews related to: {request.query}"
    
    # Print the query for debugging
    print(f"\nQuery being sent to research team: {query}")
    
    # Run the research team
    response = research_team.run(query)

    # Extract the content from the RunResponse object
    summary = response.content if hasattr(response, 'content') else str(response)
    
    # Print the full response for debugging
    print(f"\nFull response from research team:\n{summary}\n")

    # Extract sources from the markdown response (this is a simplified version)
    sources = []  # In reality, we'd parse the markdown to extract URLs

    return AgentTeamResponse(
        summary=summary,
        sources=sources
    )
