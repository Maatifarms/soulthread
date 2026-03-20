/**
 * supportNetworkGraph.js — Community Support Network Graph (Task 115)
 *
 * Maps high-quality supportive interactions between users to identify 
 * natural community pillars and reinforce peer-support density.
 */

class SupportNetworkGraph {
    constructor() {
        this.nodes = new Map(); // Users
        this.edges = new Map(); // Support Interactions (id_id)
    }

    /**
     * Registers a supportive event (e.g., a helpful comment or heart on a distress post).
     */
    async trackSupportiveEdge(giverId, receiverId, weight = 1) {
        const edgeKey = `${giverId}_${receiverId}`;
        const currentWeight = this.edges.get(edgeKey) || 0;
        this.edges.set(edgeKey, currentWeight + weight);

        console.log(`[SupportGraph] Edge updated: ${giverId} -> ${receiverId} (Weight: ${currentWeight + weight})`);

        // If weight crosses threshold, we flag the giver as a "Potential Peer Pillar"
        if (this.calculateOutdegree(giverId) > 100) {
            this.nominatePeerSupportPillar(giverId);
        }
    }

    calculateOutdegree(userId) {
        let count = 0;
        for (const [key, weight] of this.edges) {
            if (key.startsWith(`${userId}_`)) count += weight;
        }
        return count;
    }

    async nominatePeerSupportPillar(userId) {
        console.warn(`[SupportGraph] User ${userId} identified as an Organic Support Pillar. Triggering certification invite.`);
        // Logic to invite to Peer Support Certification program
    }

    /**
     * Finds "Support Clusters" using basic graph density logic to 
     * monitor regional community health.
     */
    getGraphInsights() {
        return {
            totalNodes: this.nodes.size,
            totalInteractions: this.edges.size,
            density: this.edges.size / (this.nodes.size * (this.nodes.size - 1) || 1)
        };
    }
}

export const supportGraph = new SupportNetworkGraph();
