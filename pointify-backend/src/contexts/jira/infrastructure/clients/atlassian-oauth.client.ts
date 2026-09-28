import { Injectable, Logger } from '@nestjs/common';
import type {
  IJiraGateway,
  AtlassianTokens,
} from '../../domain/jira-gateway.interface.js';
import type {
  JiraBoard,
  JiraCloudSite,
  JiraIssue,
  JiraSprint,
} from '../../domain/jira-connection.entity.js';

@Injectable()
export class AtlassianOAuthClient implements IJiraGateway {
  private readonly logger = new Logger(AtlassianOAuthClient.name);

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly isMock: boolean;

  constructor() {
    this.clientId = process.env.ATLASSIAN_CLIENT_ID || '';
    this.clientSecret = process.env.ATLASSIAN_CLIENT_SECRET || '';
    this.redirectUri =
      process.env.ATLASSIAN_REDIRECT_URI || 'http://localhost:5173/profile?jira=callback';
    this.isMock = process.env.MOCK_JIRA === 'true';

    if (this.isMock) {
      this.logger.warn(
        'MOCK_JIRA is enabled. Running Jira integration in MOCK / DEMO mode for testing.',
      );
    } else if (!this.clientId || !this.clientSecret) {
      this.logger.warn(
        'Atlassian credentials not found in environment. Real OAuth flow will require ATLASSIAN_CLIENT_ID and ATLASSIAN_CLIENT_SECRET.',
      );
    }
  }

  getAuthorizationUrl(state: string): string {
    if (this.isMock) {
      // In mock mode, redirect straight back to redirectUri with mock code and state
      const url = new URL(this.redirectUri);
      url.searchParams.set('code', 'mock_atlassian_auth_code_' + Date.now());
      url.searchParams.set('state', state);
      return url.toString();
    }

    if (!this.clientId) {
      throw new Error('ATLASSIAN_CLIENT_ID is not configured in backend environment.');
    }

    const scopes = [
      'read:jira-work',
      'write:jira-work',
      'read:jira-user',
      'read:board-scope:jira-software',
      'write:board-scope:jira-software',
      'read:sprint:jira-software',
      'read:project:jira',
      'offline_access',
    ].join(' ');

    const params = new URLSearchParams({
      audience: 'api.atlassian.com',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      state,
      response_type: 'code',
      prompt: 'consent',
    });

    return `https://auth.atlassian.com/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<AtlassianTokens> {
    if (this.isMock || code.startsWith('mock_')) {
      return {
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        expiresIn: 3600,
      };
    }

    const response = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Failed to exchange Atlassian code: ${response.status} - ${errText}`);
      throw new Error(`Atlassian token exchange failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<AtlassianTokens> {
    if (this.isMock || refreshToken.startsWith('mock_')) {
      return {
        accessToken: `mock_refreshed_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        expiresIn: 3600,
      };
    }

    const response = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Failed to refresh Atlassian token: ${response.status} - ${errText}`);
      throw new Error(`Atlassian token refresh failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  async getAccessibleResources(accessToken: string): Promise<JiraCloudSite[]> {
    if (this.isMock || accessToken.startsWith('mock_')) {
      return [
        {
          id: 'mock-cloud-site-001',
          name: 'Pointify Agile Workspace',
          url: 'https://pointify-agile.atlassian.net',
          scopes: ['read:jira-work', 'write:jira-work'],
          avatarUrl: 'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png',
        },
      ];
    }

    const response = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error(`Failed to fetch accessible resources: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch accessible resources: ${response.status} - ${errorText}`);
    }

    const sites = (await response.json()) as Array<{
      id: string;
      name: string;
      url: string;
      scopes: string[];
      avatarUrl?: string;
    }>;

    return sites.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      scopes: s.scopes || [],
      avatarUrl: s.avatarUrl,
    }));
  }

  async getBoards(cloudId: string, accessToken: string): Promise<JiraBoard[]> {
    if (this.isMock || accessToken.startsWith('mock_')) {
      return [
        { id: '101', name: 'Scrum Core Team Board', type: 'scrum' },
        { id: '102', name: 'Mobile App Kanban', type: 'kanban' },
      ];
    }

    const response = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error(`Failed to fetch Jira boards: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch Jira boards: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      values: Array<{ id: number; name: string; type: string }>;
    };

    return data.values.map((b) => ({
      id: String(b.id),
      name: b.name,
      type: b.type,
    }));
  }

  async getBoardSprints(
    cloudId: string,
    boardId: string,
    accessToken: string,
  ): Promise<JiraSprint[]> {
    if (this.isMock || accessToken.startsWith('mock_')) {
      return [
        {
          id: '201',
          name: 'Sprint 24 - Core Poker Experience',
          state: 'active',
          startDate: new Date().toISOString(),
          goal: 'Complete Jira sync & interactive planning poker refinements',
        },
        {
          id: '202',
          name: 'Sprint 25 - Next Milestones',
          state: 'future',
          startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
          goal: 'Upcoming enhancements',
        },
      ];
    }

    const response = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board/${boardId}/sprint?state=active,future`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error(`Failed to fetch board sprints: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch board sprints: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      values: Array<{
        id: number;
        name: string;
        state: 'active' | 'future' | 'closed';
        startDate?: string;
        endDate?: string;
        goal?: string;
      }>;
    };

    return (data.values || []).map((s) => ({
      id: String(s.id),
      name: s.name,
      state: s.state,
      startDate: s.startDate,
      endDate: s.endDate,
      goal: s.goal,
    }));
  }

  async getActiveSprint(
    cloudId: string,
    boardId: string,
    accessToken: string,
  ): Promise<JiraSprint | null> {
    if (this.isMock || accessToken.startsWith('mock_')) {
      return {
        id: '201',
        name: 'Sprint 24 - Core Poker Experience',
        state: 'active',
        startDate: new Date().toISOString(),
        goal: 'Complete Jira sync & interactive planning poker refinements',
      };
    }

    const response = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board/${boardId}/sprint?state=active`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error(`Failed to fetch active sprint: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch active sprint: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      values: Array<{
        id: number;
        name: string;
        state: 'active' | 'future' | 'closed';
        startDate?: string;
        endDate?: string;
        goal?: string;
      }>;
    };

    const active = data.values.find((s) => s.state === 'active') || data.values[0];
    if (!active) {
      return null;
    }

    return {
      id: String(active.id),
      name: active.name,
      state: active.state,
      startDate: active.startDate,
      endDate: active.endDate,
      goal: active.goal,
    };
  }

  async getSprintIssues(
    cloudId: string,
    sprintId: string,
    accessToken: string,
    siteUrl?: string,
  ): Promise<JiraIssue[]> {
    if (this.isMock || accessToken.startsWith('mock_')) {
      return [
        {
          id: '10001',
          key: 'POINT-101',
          summary: 'Implement Jira OAuth 2.0 3LO token authorization flow',
          issueType: 'Story',
          priority: 'High',
          status: 'In Progress',
          storyPoints: null,
          jiraUrl: 'https://pointify-agile.atlassian.net/browse/POINT-101',
          description:
            'As an Agile squad facilitator, I want to authenticate with Atlassian OAuth 2.0 (3LO) so that sprint backlog issues can be imported into Pointify.\n\nh3. Acceptance Criteria\n- [x] Support token exchange and automated refresh with Atlassian API.\n- [x] Encrypt tokens in persistence storage with AES-256-GCM.\n- [ ] Present user disconnect control in integrations sheet.\n\n:::panel{type="info"}\nToken rotation occurs 5 minutes before expiration to prevent 401 unauthenticated drops.\n:::\n\n|| Scope || Permission || Required ||\n| read:jira-work | Read issues and sprints | Yes |\n| write:jira-work | Update story points | Yes |',
          assignee: {
            displayName: 'Alex Rivers',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
          },
        },
        {
          id: '10002',
          key: 'POINT-102',
          summary: 'Realtime story backlog navigation and synchronized round selection',
          issueType: 'Story',
          priority: 'Highest',
          status: 'To Do',
          storyPoints: null,
          jiraUrl: 'https://pointify-agile.atlassian.net/browse/POINT-102',
          description:
            'Enable facilitators to switch the current active estimation round across sprint backlog stories with instant WebSocket synchronization.\n\nh3. Acceptance Criteria\n- [x] Seamless drawer navigation with beUI shared layout motion.\n- [ ] Instant table arena projection update across all connected estimators.\n\n:::panel{type="warning"}\nEnsure network latency compensation is active when synchronizing across remote regions.\n:::',
          assignee: {
            displayName: 'Elena Rostova',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elena',
          },
        },
        {
          id: '10003',
          key: 'POINT-103',
          summary: 'Story Points 1-click write-back with customfield fallback detection',
          issueType: 'Task',
          priority: 'Medium',
          status: 'To Do',
          storyPoints: null,
          jiraUrl: 'https://pointify-agile.atlassian.net/browse/POINT-103',
          description:
            'Sync the final consensus story point directly to the linked Jira Cloud issue field upon round conclusion.\n\nh3. Acceptance Criteria\n- [x] Query Agile estimation endpoint `/rest/agile/1.0/issue/{key}/estimation`.\n- [ ] Fallback to customfield detection via `/rest/api/3/issue/{key}/editmeta`.\n\n```bash\n# Verify field update via curl\ncurl -X PUT "https://api.atlassian.com/ex/jira/{cloudId}/rest/agile/1.0/issue/POINT-103/estimation" \\\n  -H "Authorization: Bearer {token}" \\\n  -d \'{"value": 5}\'\n```',
          assignee: {
            displayName: 'Marcus Vance',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus',
          },
        },
        {
          id: '10004',
          key: 'POINT-104',
          summary: 'User integrations profile tab and Atlassian account disconnect modal',
          issueType: 'Improvement',
          priority: 'Low',
          status: 'To Do',
          storyPoints: null,
          jiraUrl: 'https://pointify-agile.atlassian.net/browse/POINT-104',
          description:
            'Provide an intuitive management view within user profile settings to inspect active Jira cloud connections and revoke OAuth grants.\n\nh3. Acceptance Criteria\n- [ ] Display list of authorized Jira workspaces with connected timestamp.\n- [ ] Offer double-confirmation modal before disconnecting.',
          assignee: null,
        },
      ];
    }

    const fields = [
      'summary',
      'issuetype',
      'priority',
      'status',
      'description',
      'assignee',
      'customfield_10016',
      'customfield_10026',
    ].join(',');

    const parseAdfText = (doc: unknown, depth = 0, listIdx?: number): string => {
      if (!doc) return '';
      if (typeof doc === 'string') return doc;
      if (typeof doc !== 'object') return '';

      const node = doc as {
        type?: string;
        text?: string;
        content?: unknown[];
        marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
        attrs?: Record<string, unknown>;
      };

      // Text node with marks (bold, italic, code, strike, link)
      if (node.text !== undefined) {
        let result = node.text;
        if (Array.isArray(node.marks)) {
          for (const mark of node.marks) {
            if (mark.type === 'strong') result = `**${result}**`;
            else if (mark.type === 'em') result = `*${result}*`;
            else if (mark.type === 'code') result = `\`${result}\``;
            else if (mark.type === 'strike') result = `~~${result}~~`;
            else if (mark.type === 'link' && mark.attrs?.href) {
              result = `[${result}](${mark.attrs.href})`;
            }
          }
        }
        return result;
      }

      // Mentions and inline elements
      if (node.type === 'mention') {
        return `@${node.attrs?.text || node.attrs?.id || 'user'} `;
      }
      if (node.type === 'hardBreak') return '\n';
      if (node.type === 'rule') return '\n---\n\n';

      // Container elements
      if (Array.isArray(node.content)) {
        if (node.type === 'paragraph') {
          const text = node.content.map((c) => parseAdfText(c, depth)).join('');
          return text + '\n';
        }

        if (node.type === 'heading') {
          const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2;
          const text = node.content.map((c) => parseAdfText(c, depth)).join('');
          return `\n${'#'.repeat(level)} ${text.trim()}\n\n`;
        }

        if (node.type === 'orderedList') {
          const items = node.content.map((item, idx) =>
            parseAdfText(item, depth + 1, idx + 1),
          );
          return items.join('\n') + '\n';
        }

        if (node.type === 'bulletList') {
          const items = node.content.map((item) =>
            parseAdfText(item, depth + 1),
          );
          return items.join('\n') + '\n';
        }

        if (node.type === 'listItem') {
          const indent = depth > 1 ? '   ' : '';
          const bulletSymbol = depth > 1 ? '◦ ' : '• ';
          const prefix = listIdx !== undefined ? `${listIdx}. ` : `${indent}${bulletSymbol}`;

          const children: string[] = [];
          for (const child of node.content) {
            const cType = (child as { type?: string }).type;
            if (cType === 'bulletList' || cType === 'orderedList') {
              children.push(parseAdfText(child, depth + 1));
            } else {
              children.push(parseAdfText(child, depth));
            }
          }

          const first = children[0]?.trim() || '';
          const rest = children.slice(1).join('\n');
          return rest ? `${prefix}${first}\n${rest}` : `${prefix}${first}`;
        }

        if (node.type === 'taskList') {
          return node.content.map((c) => parseAdfText(c, depth)).join('\n') + '\n\n';
        }
        if (node.type === 'taskItem') {
          const isDone = node.attrs?.state === 'DONE';
          const text = node.content.map((c) => parseAdfText(c, depth)).join('').trim();
          return `${isDone ? '- [x]' : '- [ ]'} ${text}`;
        }
        if (node.type === 'codeBlock') {
          let lang = typeof node.attrs?.language === 'string' ? node.attrs.language : '';
          const text = node.content.map((c) => parseAdfText(c, depth)).join('');
          if (!lang) {
            const trimmed = text.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              lang = 'json';
            }
          }
          return `\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
        }
        if (node.type === 'blockquote') {
          const text = node.content.map((c) => parseAdfText(c, depth)).join('');
          return text.split('\n').map((l) => `> ${l}`).join('\n') + '\n\n';
        }
        if (node.type === 'panel') {
          const panelType = typeof node.attrs?.panelType === 'string' ? node.attrs.panelType : 'info';
          const text = node.content.map((c) => parseAdfText(c, depth)).join('');
          return `:::panel{type="${panelType}"}\n${text}\n:::\n\n`;
        }
        if (node.type === 'table') {
          return node.content.map((c) => parseAdfText(c, depth)).join('\n') + '\n\n';
        }
        if (node.type === 'tableRow') {
          const cells = node.content.map((c) => parseAdfText(c, depth));
          return `| ${cells.join(' | ')} |`;
        }
        if (node.type === 'tableHeader' || node.type === 'tableCell') {
          return node.content.map((c) => parseAdfText(c, depth)).join('').replace(/\n+/g, ' ').trim();
        }

        return node.content.map((c) => parseAdfText(c, depth)).join('');
      }

      return '';
    };

    let baseSiteUrl = siteUrl ? siteUrl.replace(/\/+$/, '') : '';
    if (!baseSiteUrl && !this.isMock && !accessToken.startsWith('mock_')) {
      try {
        const resources = await this.getAccessibleResources(accessToken);
        const matched = resources.find((r) => r.id === cloudId);
        if (matched?.url) {
          baseSiteUrl = matched.url.replace(/\/+$/, '');
        }
      } catch {
        // ignore fallback
      }
    }

    // 1. Primary: Use standard Jira Platform Search JQL API (requires read:jira-work, robust & standard)
    try {
      const searchRes = await fetch(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql?jql=sprint=${encodeURIComponent(sprintId)}&fields=${fields}&maxResults=100`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        },
      );

      if (searchRes.ok) {
        const data = (await searchRes.json()) as {
          issues: Array<{
            id: string;
            key: string;
            fields: {
              summary: string;
              issuetype?: { name: string };
              priority?: { name: string };
              status?: { name: string };
              description?: unknown;
              assignee?: { displayName: string; avatarUrls?: Record<string, string> } | null;
              customfield_10016?: number;
              customfield_10026?: number;
            };
          }>;
        };

        return (data.issues || []).map((issue) => {
          const sp =
            typeof issue.fields.customfield_10016 === 'number'
              ? issue.fields.customfield_10016
              : typeof issue.fields.customfield_10026 === 'number'
                ? issue.fields.customfield_10026
                : null;

          const desc = issue.fields.description
            ? parseAdfText(issue.fields.description).trim()
            : null;

          const assignee = issue.fields.assignee
            ? {
                displayName: issue.fields.assignee.displayName,
                avatarUrl:
                  issue.fields.assignee.avatarUrls?.['48x48'] ||
                  issue.fields.assignee.avatarUrls?.['32x32'] ||
                  undefined,
              }
            : null;

          const fullJiraUrl = baseSiteUrl
            ? `${baseSiteUrl}/browse/${issue.key}`
            : `https://atlassian.net/browse/${issue.key}`;

          return {
            id: issue.id,
            key: issue.key,
            summary: issue.fields.summary,
            issueType: issue.fields.issuetype?.name || 'Story',
            priority: issue.fields.priority?.name || 'Medium',
            status: issue.fields.status?.name || 'To Do',
            storyPoints: sp,
            jiraUrl: fullJiraUrl,
            description: desc,
            assignee,
          };
        });
      } else {
        const text = await searchRes.text().catch(() => '');
        this.logger.warn(`Search JQL for sprint ${sprintId} returned ${searchRes.status}: ${text}`);
      }
    } catch (e) {
      this.logger.warn(`Search JQL for sprint ${sprintId} failed, trying agile endpoint: ${e}`);
    }

    // 2. Fallback: Agile sprint issues endpoint
    const response = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/sprint/${sprintId}/issue?fields=${fields}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error(`Failed to fetch sprint issues: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch sprint issues: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      issues: Array<{
        id: string;
        key: string;
        fields: {
          summary: string;
          issuetype?: { name: string };
          priority?: { name: string };
          status?: { name: string };
          description?: unknown;
          assignee?: { displayName: string; avatarUrls?: Record<string, string> } | null;
          customfield_10016?: number;
          customfield_10026?: number;
        };
      }>;
    };

    return (data.issues || []).map((issue) => {
      const sp =
        typeof issue.fields.customfield_10016 === 'number'
          ? issue.fields.customfield_10016
          : typeof issue.fields.customfield_10026 === 'number'
            ? issue.fields.customfield_10026
            : null;

      const desc = issue.fields.description ? parseAdfText(issue.fields.description).trim() : null;

      const assignee = issue.fields.assignee
        ? {
            displayName: issue.fields.assignee.displayName,
            avatarUrl:
              issue.fields.assignee.avatarUrls?.['48x48'] ||
              issue.fields.assignee.avatarUrls?.['32x32'] ||
              undefined,
          }
        : null;

      const fullJiraUrl = baseSiteUrl
        ? `${baseSiteUrl}/browse/${issue.key}`
        : `https://atlassian.net/browse/${issue.key}`;

      return {
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        issueType: issue.fields.issuetype?.name || 'Story',
        priority: issue.fields.priority?.name || 'Medium',
        status: issue.fields.status?.name || 'To Do',
        storyPoints: sp,
        jiraUrl: fullJiraUrl,
        description: desc,
        assignee,
      };
    });
  }

  async updateStoryPoints(
    cloudId: string,
    issueKey: string,
    points: number,
    accessToken: string,
  ): Promise<{ success: boolean; fieldUsed: string }> {
    if (this.isMock || accessToken.startsWith('mock_')) {
      this.logger.log(`[MOCK JIRA] Updated issue ${issueKey} with ${points} story points.`);
      return { success: true, fieldUsed: 'estimation' };
    }

    // 1. Try Agile estimation endpoint first
    try {
      const agileRes = await fetch(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/issue/${issueKey}/estimation`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: points }),
        },
      );

      if (agileRes.ok) {
        return { success: true, fieldUsed: 'agile.estimation' };
      }
    } catch (e) {
      this.logger.warn(`Agile estimation update failed, trying customfield fallback: ${e}`);
    }

    // 2. Fallback: Query issue editmeta to locate the Story Points customfield
    try {
      const metaRes = await fetch(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/editmeta`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        },
      );

      let targetField = 'customfield_10016';
      if (metaRes.ok) {
        const meta = (await metaRes.json()) as {
          fields?: Record<string, { name: string }>;
        };
        if (meta.fields) {
          const foundKey = Object.keys(meta.fields).find((k) => {
            const name = meta.fields?.[k]?.name?.toLowerCase() || '';
            return name.includes('story point') || name.includes('story points') || name.includes('estimate');
          });
          if (foundKey) {
            targetField = foundKey;
          }
        }
      }

      // Update via issue REST API
      const updateRes = await fetch(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              [targetField]: points,
            },
          }),
        },
      );

      if (!updateRes.ok) {
        const text = await updateRes.text();
        throw new Error(`Failed to update issue field: ${updateRes.status} - ${text}`);
      }

      return { success: true, fieldUsed: targetField };
    } catch (err) {
      this.logger.error(`Failed to update story points on Jira: ${err}`);
      throw err;
    }
  }
}
