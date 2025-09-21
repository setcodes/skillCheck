# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

Please do **NOT** report security vulnerabilities through public GitHub issues.

Instead, please report them via one of the following methods:

1. **Email**: Send an email to [security@skillfoundry.com](mailto:security@skillfoundry.com)
2. **GitHub Security Advisories**: Use GitHub's private vulnerability reporting feature

### What to Include

When reporting a security vulnerability, please include:

- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact of the vulnerability
- Any suggested fixes or mitigations
- Your contact information (optional, but helpful for follow-up questions)

### What to Expect

After you submit a report, we will:

1. **Acknowledge** your report within 48 hours
2. **Investigate** the issue and determine its impact
3. **Develop** a fix for the vulnerability
4. **Release** the fix in a timely manner
5. **Credit** you for the discovery (unless you prefer to remain anonymous)

### Security Best Practices

When using SkillCheck:

1. **Keep dependencies updated**: Regularly update npm packages to get security patches
2. **Use HTTPS**: Always use HTTPS in production environments
3. **Validate inputs**: Be cautious with user-generated content
4. **Regular backups**: Keep regular backups of your data
5. **Access control**: Implement proper access controls for sensitive features

### Security Considerations

This application handles:

- **User data**: Interview results, candidate information
- **Code execution**: Runs user-submitted code in a sandboxed environment
- **File uploads**: Handles question and task file uploads
- **Local storage**: Stores data in browser's local storage

### Known Security Limitations

- Code execution happens in the browser sandbox (not server-side)
- No server-side authentication or authorization
- Data is stored locally in the browser
- File uploads are processed client-side only

### Security Updates

Security updates will be released as patch versions (e.g., 1.0.1, 1.0.2) and will be clearly marked in the changelog.

### Responsible Disclosure

We follow responsible disclosure practices:

- Vulnerabilities are kept private until a fix is available
- We work with reporters to coordinate disclosure
- Credit is given to security researchers who help improve our security
- We aim to fix critical vulnerabilities within 7 days

### Contact

For security-related questions or concerns, please contact us at [security@skillfoundry.com](mailto:security@skillfoundry.com).

---

Thank you for helping keep SkillCheck and our users safe!
